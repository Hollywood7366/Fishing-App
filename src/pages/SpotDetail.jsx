import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocationData } from '../contexts/LocationDataContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import useWeatherData, { useWeatherForecast } from '../hooks/useWeatherData';
import useTideData, { useTideForecast } from '../hooks/useTideData';
import useScoring from '../hooks/useScoring';
import Card from '../components/common/Card';
import ScoreGauge from '../components/scoring/ScoreGauge';
import FactorBreakdown from '../components/scoring/FactorBreakdown';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import BaitRecommendations from '../components/fishing/BaitRecommendations';
import BiteTimePredictions from '../components/fishing/BiteTimePredictions';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateHelpers';
import { getMoonData } from '../services/moonPhaseService';
import allSpeciesData from '../data/species.json';
import { filterForecastByDate, getFishingOutlook, summarizeForecastDay } from '../utils/forecastUtils';

const SpotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLocationById } = useLocationData();
  const { isFavorite, toggleFavorite, getTargetSpeciesData } = useUserPreferences();
  
  const location = getLocationById(id);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [viewMode, setViewMode] = useState('current');
  const todayIso = new Date().toISOString().split('T')[0];
  const [forecastDate, setForecastDate] = useState(todayIso);
  const targetSpecies = getTargetSpeciesData();
  
  // Fetch data
  const { currentWeather, loading: weatherLoading, lastUpdated: weatherUpdated, refresh: refreshWeather } = 
    useWeatherData(location?.lat, location?.lng);
  const { currentTide, loading: tideLoading, lastUpdated: tideUpdated, refresh: refreshTide } = 
    useTideData(location?.lat, location?.lng);
  // Extend forecast to 30 days for planning (tides stay consistent; weather best-effort)
  const { forecast: weatherForecast, loading: weatherForecastLoading, error: weatherForecastError } =
    useWeatherForecast(location?.lat, location?.lng, 30);
  const { forecast: tideForecast, loading: tideForecastLoading, error: tideForecastError } =
    useTideForecast(location?.lat, location?.lng, 30);
  
  // Get species object - from selection, user preferences, or location's target species
  const getSpeciesForBait = () => {
    // 1. If user selected a species from dropdown, use that
    if (selectedSpecies) {
      return allSpeciesData.find(s => s.id === selectedSpecies);
    }
    // 2. If user has target species in preferences, use first one
    if (targetSpecies.length > 0) {
      return targetSpecies[0];
    }
    // 3. If location has target species, find first matching one
    if (location?.targetSpecies?.length > 0) {
      const locationSpeciesId = location.targetSpecies[0].toLowerCase().replace(/\s+/g, '');
      // Try to match by name
      const matched = allSpeciesData.find(s => 
        s.name.toLowerCase().includes(locationSpeciesId) || 
        locationSpeciesId.includes(s.id.toLowerCase())
      );
      if (matched) return matched;
      // Default to redfish for Louisiana locations
      return allSpeciesData.find(s => s.id === 'redfish');
    }
    // 4. Default to redfish
    return allSpeciesData.find(s => s.id === 'redfish');
  };
  
  const speciesObj = selectedSpecies ? targetSpecies.find(s => s.id === selectedSpecies) : null;
  const baitSpecies = getSpeciesForBait();
  
  // Calculate score
  const { score, loading: scoreLoading } = useScoring(location, currentWeather, currentTide, speciesObj);
  
  const moonData = getMoonData();

  const selectedDateObj = forecastDate ? new Date(forecastDate) : new Date();
  const weatherForDay = filterForecastByDate(weatherForecast?.list || [], selectedDateObj);
  const summarizedWeather = summarizeForecastDay(weatherForDay);
  const weatherSummary = summarizedWeather ? { ...summarizedWeather, source: weatherForecast?._source || summarizedWeather.source } : null;
  const fishingOutlook = getFishingOutlook(weatherSummary);
  const tideForDay = (tideForecast?.predictions || []).filter((p) => {
    const timeStr = new Date(p.time).toDateString();
    return timeStr === selectedDateObj.toDateString();
  });

  const getTideStats = (predictions = []) => {
    if (!predictions.length) return null;
    const heights = predictions.map((p) => p.height).filter((h) => typeof h === 'number' && !Number.isNaN(h));
    const maxH = heights.length ? Math.max(...heights) : null;
    const minH = heights.length ? Math.min(...heights) : null;
    const range = maxH !== null && minH !== null ? +(maxH - minH).toFixed(2) : null;

    const nowTs = Date.now();
    const upcomingHigh = predictions.find((p) => p.type === 'high' && new Date(p.time).getTime() > nowTs);
    const upcomingLow = predictions.find((p) => p.type === 'low' && new Date(p.time).getTime() > nowTs);

    return {
      range,
      high: upcomingHigh,
      low: upcomingLow
    };
  };

  const currentTideStats = getTideStats(currentTide?.predictions || []);
  const forecastTideStats = getTideStats(tideForDay);
  
  if (!location) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Location Not Found</h2>
        <Button onClick={() => navigate('/locations')}>Back to Locations</Button>
      </div>
    );
  }
  
  const loading = weatherLoading || tideLoading || scoreLoading;
  const favorite = isFavorite(location.id);
  
  const handleShare = () => {
    const url = `${window.location.origin}/location/${location.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${location.name} - Fishing Conditions`,
        text: score ? `Current fishing score: ${score.overall}/100 (${score.rating})` : 'Check out this fishing spot',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button variant="secondary" onClick={() => navigate('/locations')}>
          ← Back to Locations
        </Button>
      </div>

      {/* Mode Toggle */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant={viewMode === 'current' ? 'primary' : 'secondary'} onClick={() => setViewMode('current')}>
              Current Conditions
            </Button>
            <Button variant={viewMode === 'forecast' ? 'primary' : 'secondary'} onClick={() => setViewMode('forecast')}>
              Forecast Mode
            </Button>
          </div>
          {viewMode === 'forecast' && (
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              “If you don't like the weather in Louisiana, just wait an hour or two.....”
            </p>
          )}
        </div>
      </Card>
      
      {/* Location Header */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px' }}>{location.name}</h1>
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {location.region}
            </p>
            {location.description && (
              <p style={{ margin: '8px 0', fontSize: '15px', lineHeight: '1.5' }}>
                {location.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              <Button variant={favorite ? 'primary' : 'secondary'} onClick={() => toggleFavorite(location.id)}>
                {favorite ? '⭐ Favorited' : '☆ Add to Favorites'}
              </Button>
              <Button variant="secondary" onClick={handleShare}>
                📤 Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {viewMode === 'current' ? (
        <>
          {/* Current Score */}
          {loading ? (
            <LoadingSpinner text="Loading current conditions..." />
          ) : score ? (
            <Card title="Current Fishing Conditions" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ScoreGauge score={score.overall} size="large" scoreData={score} showReasons={true} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                  <div style={{ minWidth: '160px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
                      Last updated
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {weatherUpdated ? getRelativeTime(weatherUpdated) : 'Just now'}
                    </p>
                  </div>
                  <div style={{ minWidth: '160px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
                      Current tide
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {currentTide ? `${currentTide.phase} • ${currentTide.height} ft` : '—'}
                    </p>
                  </div>
                  <div style={{ minWidth: '160px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
                      Wind
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {currentWeather ? `${Math.round(currentWeather.wind.speed)} mph` : '—'}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => { refreshWeather(); refreshTide(); }} style={{ marginLeft: 'auto' }}>
                    🔄 Refresh Data
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Current Conditions Details (now directly under current conditions) */}
          <Card title="Detailed Conditions" style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {currentWeather && (
                <>
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                      Temperature
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                      {Math.round(currentWeather.main.temp)}°F
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                      Wind
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                      {Math.round(currentWeather.wind.speed)} mph
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                      Barometer
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                      {Math.round(currentWeather.main.pressure)} mb
                    </p>
                  </div>
                </>
              )}
              
              {currentTide && (
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                    Tide
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                    {currentTide.phase}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {currentTide.height} ft
                  </p>
                  {currentTideStats?.range !== null && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Range today: {currentTideStats.range} ft
                    </p>
                  )}
                  {(currentTideStats?.high || currentTideStats?.low) && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      {currentTideStats.high ? `Next High: ${new Date(currentTideStats.high.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} • ` : ''}
                      {currentTideStats.low ? `Next Low: ${new Date(currentTideStats.low.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  Moon
                </p>
                <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                  {moonData.emoji} {moonData.displayName}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {moonData.illumination}% lit
                </p>
              </div>
            </div>
          </Card>

          {/* Species Selector */}
          {targetSpecies.length > 0 && (
            <Card title="Filter by Target Species" style={{ marginBottom: '20px' }}>
              <select
                value={selectedSpecies || ''}
                onChange={(e) => setSelectedSpecies(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">All Species (General Score)</option>
                {targetSpecies.map(species => (
                  <option key={species.id} value={species.id}>
                    {species.name}
                  </option>
                ))}
              </select>
            </Card>
          )}

          {/* Factor Breakdown */}
          {score && score.factors && (
            <Card title="Condition Breakdown" style={{ marginBottom: '20px' }}>
              <FactorBreakdown factors={score.factors} />
            </Card>
          )}

          {/* Bite Time Predictions */}
          <BiteTimePredictions lat={location.lat} lng={location.lng} />
          
          {/* Bait Recommendations - Always show with best available species */}
          {baitSpecies && (
            <BaitRecommendations species={baitSpecies} />
          )}
        </>
      ) : (
        <>
          <Card title="Plan Your Trip" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <label style={{ fontWeight: '600' }}>
                Pick a day:
              </label>
              <input
                type="date"
                value={forecastDate}
                min={todayIso}
                max={new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                onChange={(e) => setForecastDate(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '15px'
                }}
              />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                Louisiana weather swings fast—double-check closer to launch.
              </p>
            </div>
          </Card>

          {(weatherForecastLoading || tideForecastLoading) && <LoadingSpinner text="Loading forecast..." />}

          {(weatherForecastError || tideForecastError) && (
            <Card style={{ marginBottom: '20px' }}>
              <p style={{ margin: 0, color: '#c62828' }}>
                {weatherForecastError || tideForecastError}
              </p>
            </Card>
          )}

          <Card title="Forecasted Conditions" style={{ marginBottom: '20px' }}>
            {weatherSummary ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Air Temp (avg)</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {Math.round(weatherSummary.avgTemp)}°F
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Range: {weatherSummary.minTemp ? Math.round(weatherSummary.minTemp) : '—'}°–{weatherSummary.maxTemp ? Math.round(weatherSummary.maxTemp) : '—'}°
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Wind (avg)</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {weatherSummary.wind ? Math.round(weatherSummary.wind) : '—'} mph
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Pressure</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {weatherSummary.pressure ? Math.round(weatherSummary.pressure) : '—'} mb
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Humidity</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                    {weatherSummary.humidity ? Math.round(weatherSummary.humidity) : '—'}%
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                No forecast available for this date yet. Try a closer day or check back soon.
              </p>
            )}

            {fishingOutlook && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: '700', fontSize: '16px' }}>
                  Outlook: {fishingOutlook.label.charAt(0).toUpperCase() + fishingOutlook.label.slice(1)} ({fishingOutlook.score}/100)
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Based on wind, pressure, cloud cover, and humidity for the selected day.
                </p>
              </div>
            )}

            {weatherSummary?.source && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Source: {weatherSummary.source === 'noaa-nws' ? 'NOAA / NWS' : weatherSummary.source === 'openweathermap' ? 'OpenWeather' : weatherSummary.source === 'open-meteo' ? 'Open-Meteo' : 'Fallback'}
              </p>
            )}
          </Card>

          <Card title="Tide Predictions" style={{ marginBottom: '20px' }}>
            {tideForDay.length ? (
              <>
                {forecastTideStats?.range !== null && (
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Tidal range: {forecastTideStats.range} ft
                    {forecastTideStats.high ? ` • High: ${new Date(forecastTideStats.high.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                    {forecastTideStats.low ? ` • Low: ${new Date(forecastTideStats.low.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  {tideForDay.slice(0, 6).map((tide) => (
                    <div key={tide.time} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '10px', background: '#f8fafc' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {new Date(tide.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </p>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>
                        {tide.type.toUpperCase()} • {tide.height.toFixed(2)} ft
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Tide predictions not available for this date yet.
              </p>
            )}
          </Card>
        </>
      )}
      
      {/* Location Details */}
      <Card title="Location Details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {location.waterType && (
            <div>
              <strong>Water Type:</strong> {location.waterType}
            </div>
          )}
          
          {location.targetSpecies && location.targetSpecies.length > 0 && (
            <div>
              <strong>Target Species:</strong>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {location.targetSpecies.map(speciesName => {
                  // Try to find the full species data from allSpeciesData
                  // speciesName is the ID like "redfish", "speckledTrout", etc.
                  const speciesInfo = allSpeciesData.find(s => 
                    s.id.toLowerCase() === speciesName.toLowerCase() ||
                    s.name.toLowerCase().includes(speciesName.toLowerCase())
                  );
                  
                  return (
                    <div 
                      key={speciesName}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: speciesInfo?.baitsAndLures ? '12px' : '0'
                      }}>
                        <span style={{
                          fontSize: '20px'
                        }}>🐟</span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1976d2'
                        }}>
                          {speciesInfo?.name || speciesName}
                        </span>
                      </div>
                      
                      {/* Bait & Lure Recommendations for this species */}
                      {speciesInfo?.baitsAndLures && (
                        <div>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            🎣 Best Baits & Lures:
                          </div>
                          
                          {/* Top Picks */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {speciesInfo.baitsAndLures.topPicks?.slice(0, 3).map((bait, index) => (
                              <div 
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  padding: '10px 12px',
                                  backgroundColor: index === 0 ? '#e3f2fd' : 'white',
                                  borderRadius: '8px',
                                  border: index === 0 ? '2px solid #1976d2' : '1px solid #e0e0e0'
                                }}
                              >
                                <span style={{ fontSize: '18px' }}>
                                  {bait.type === 'live' ? '🦐' : 
                                   bait.type === 'lure' ? '🎣' : 
                                   bait.type === 'soft plastic' ? '🪱' : 
                                   bait.type === 'cut bait' ? '🔪' :
                                   bait.type === 'dead bait' ? '🐟' :
                                   bait.type === 'natural' ? '🦀' : '🎣'}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: '600', 
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}>
                                    {bait.name}
                                    {index === 0 && (
                                      <span style={{
                                        fontSize: '9px',
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                      }}>
                                        TOP PICK
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--text-secondary)',
                                    marginTop: '2px'
                                  }}>
                                    💡 {bait.tip}
                                  </div>
                                  {/* Effectiveness bar */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '6px'
                                  }}>
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '1px 5px',
                                      backgroundColor: 'rgba(0,0,0,0.05)',
                                      borderRadius: '4px',
                                      textTransform: 'capitalize'
                                    }}>
                                      {bait.type}
                                    </span>
                                    <div style={{
                                      flex: 1,
                                      height: '4px',
                                      backgroundColor: '#e0e0e0',
                                      borderRadius: '2px',
                                      overflow: 'hidden',
                                      maxWidth: '80px'
                                    }}>
                                      <div style={{
                                        width: `${bait.rating}%`,
                                        height: '100%',
                                        backgroundColor: bait.rating >= 90 ? '#1976d2' : bait.rating >= 80 ? '#43a047' : '#fb8c00',
                                        borderRadius: '2px'
                                      }} />
                                    </div>
                                    <span style={{ 
                                      fontSize: '10px', 
                                      fontWeight: '600',
                                      color: bait.rating >= 90 ? '#1976d2' : bait.rating >= 80 ? '#43a047' : '#fb8c00'
                                    }}>
                                      {bait.rating}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Recommended Rigs */}
                          {speciesInfo.baitsAndLures.rigs && speciesInfo.baitsAndLures.rigs.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                                marginBottom: '6px'
                              }}>
                                🪢 Recommended Rigs:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {speciesInfo.baitsAndLures.rigs.slice(0, 3).map((rig, index) => (
                                  <span
                                    key={index}
                                    title={rig.description}
                                    style={{
                                      fontSize: '11px',
                                      padding: '4px 8px',
                                      backgroundColor: '#fff3e0',
                                      color: '#e65100',
                                      borderRadius: '6px',
                                      cursor: 'help'
                                    }}
                                  >
                                    {rig.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {location.facilities && location.facilities.length > 0 && (
            <div>
              <strong>Facilities:</strong>
              <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {location.facilities.map(facility => (
                  <span 
                    key={facility}
                    style={{
                      fontSize: '13px',
                      padding: '4px 10px',
                      backgroundColor: '#f5f5f5',
                      color: 'var(--text-primary)',
                      borderRadius: '12px'
                    }}
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SpotDetail;


