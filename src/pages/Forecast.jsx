import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationData } from '../contexts/LocationDataContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getDayName, formatDate, getWeekdayAbbr, getMonthAbbr } from '../utils/dateHelpers';
import { getMoonData } from '../services/moonPhaseService';

const Forecast = () => {
  const navigate = useNavigate();
  const { getAllLocations } = useLocationData();
  const { getTargetSpeciesData } = useUserPreferences();
  
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  
  const locations = getAllLocations();
  const targetSpecies = getTargetSpeciesData();
  
  // Generate 7-day forecast dates
  const forecastDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });
  
  // Mock forecast scores - in real app, would calculate from weather/tide data
  const getMockScore = (dayIndex) => {
    const base = 70;
    const variance = Math.sin(dayIndex / 7 * Math.PI * 2) * 20;
    return Math.round(base + variance);
  };
  
  const getRatingFromScore = (score) => {
    if (score >= 80) return { rating: 'excellent', color: '#1976d2' };
    if (score >= 65) return { rating: 'good', color: '#43a047' };
    if (score >= 50) return { rating: 'fair', color: '#fb8c00' };
    return { rating: 'poor', color: '#e53935' };
  };
  
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>7-Day Forecast</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Plan your fishing trips with extended forecasts
        </p>
      </div>
      
      {/* Filters */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px'
            }}>
              Select Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Choose a location...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.region})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px'
            }}>
              Target Species (Optional)
            </label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Species (General)</option>
              {targetSpecies.map(species => (
                <option key={species.id} value={species.id}>
                  {species.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      {/* Forecast Display */}
      {!selectedLocation ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>
              Select a location to view forecast
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Choose from {locations.length} available locations
            </p>
          </div>
        </Card>
      ) : (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {forecastDays.map((date, index) => {
              const score = getMockScore(index);
              const { rating, color } = getRatingFromScore(score);
              const moonData = getMoonData(date);
              
              return (
                <Card 
                  key={index}
                  style={{ 
                    textAlign: 'center',
                    padding: '16px 12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <p style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    {getDayName(date)}
                  </p>
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    {getMonthAbbr(date)} {date.getDate()}
                  </p>
                  
                  <div style={{ 
                    fontSize: '36px',
                    fontWeight: '700',
                    color: color,
                    margin: '8px 0'
                  }}>
                    {score}
                  </div>
                  
                  <div className={`badge-${rating}`} style={{ fontSize: '12px' }}>
                    {rating.charAt(0).toUpperCase() + rating.slice(1)}
                  </div>
                  
                  <p style={{ fontSize: '24px', margin: '8px 0 0 0' }}>
                    {moonData.emoji}
                  </p>
                </Card>
              );
            })}
          </div>
          
          {/* Detailed Breakdown */}
          <Card title="Forecast Details">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>Day</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Score</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Tide</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Wind</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Moon</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Temp</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastDays.map((date, index) => {
                    const score = getMockScore(index);
                    const { rating, color } = getRatingFromScore(score);
                    const moonData = getMoonData(date);
                    
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '500' }}>
                          {getDayName(date)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{ 
                            fontWeight: '600', 
                            fontSize: '18px',
                            color: color
                          }}>
                            {score}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px' }}>
                          {index % 2 === 0 ? 'Rising' : 'Falling'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px' }}>
                          {8 + index} mph
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '20px' }}>
                          {moonData.emoji}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px' }}>
                          {72 + index}°F
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => {
                const location = locations.find(l => l.id === selectedLocation);
                if (location) navigate(`/location/${location.id}`);
              }}
              className="btn btn-primary"
            >
              View Current Conditions for This Spot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;







