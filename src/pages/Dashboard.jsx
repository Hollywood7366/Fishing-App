import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationData } from '../contexts/LocationDataContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import Card from '../components/common/Card';
import LocationCard from '../components/location/LocationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMoonData } from '../services/moonPhaseService';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateHelpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { getTopLocations, getAllLocations, updateLocationScore, getRegions } = useLocationData();
  const { favoriteLocations, getTargetSpeciesData } = useUserPreferences();
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const moonData = getMoonData();
  const topLocations = getTopLocations(3);
  const favoriteLocationsList = getAllLocations().filter(loc => favoriteLocations.includes(loc.id));
  const targetSpecies = getTargetSpeciesData();
  const allLocations = getAllLocations();
  const regions = getRegions();
  
  // Handle location selection
  const handleLocationSelect = (locationId) => {
    if (locationId) {
      navigate(`/location/${locationId}`);
    }
  };
  
  // Group locations by region for the dropdown
  const locationsByRegion = {};
  allLocations.forEach(loc => {
    if (!locationsByRegion[loc.region]) {
      locationsByRegion[loc.region] = [];
    }
    locationsByRegion[loc.region].push(loc);
  });
  
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Dashboard</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {formatDate(new Date(), 'full')} • {formatTime(new Date())}
        </p>
      </div>
      
      {/* Quick Location Search */}
      <Card title="Quick Location Search" style={{ marginBottom: '20px' }}>
        <select
          value={selectedLocation}
          onChange={(e) => handleLocationSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid var(--border-color)',
            fontSize: '16px',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        >
          <option value="">Select a fishing location...</option>
          {regions.filter(r => r !== 'all').map(region => (
            <optgroup key={region} label={region}>
              {locationsByRegion[region]?.sort((a, b) => a.name.localeCompare(b.name)).map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '13px', 
          color: 'var(--text-secondary)',
          fontStyle: 'italic'
        }}>
          💡 Select any location to view current conditions and fishing scores
        </p>
      </Card>
      
      {/* Current Conditions Summary */}
      <Card title="Current Conditions" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
              Moon Phase
            </p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              {moonData.emoji} {moonData.displayName}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {moonData.illumination}% illuminated
            </p>
          </div>
          
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
              Next Major Phase
            </p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              {moonData.nextMajorPhase.type}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              In {moonData.nextMajorPhase.daysUntil} days
            </p>
          </div>
          
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
              Best Time Today
            </p>
            <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Dawn & Dusk
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              5:30 AM - 7:00 AM, 5:30 PM - 7:00 PM
            </p>
          </div>
        </div>
      </Card>
      
      {/* Target Species */}
      {targetSpecies.length > 0 && (
        <Card title="Your Target Species" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {targetSpecies.map(species => (
              <div
                key={species.id}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  flex: '1 1 200px'
                }}
              >
                <p style={{ margin: 0, fontWeight: '600', color: '#1976d2' }}>
                  {species.name}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Top Rated Locations Right Now */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Top Spots Right Now</h2>
          <button
            onClick={() => navigate('/locations')}
            className="btn btn-secondary"
          >
            View All Locations
          </button>
        </div>
        
        {topLocations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topLocations.map(loc => (
              <LocationCard
                key={loc.id}
                location={loc}
                scoreData={loc.scoreData}
                onClick={() => navigate(`/location/${loc.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '16px' }}>
                Loading location scores...
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Scores are calculated based on current conditions
              </p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Favorite Locations */}
      {favoriteLocationsList.length > 0 && (
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '22px' }}>Your Favorites</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favoriteLocationsList.slice(0, 3).map(loc => (
              <LocationCard
                key={loc.id}
                location={loc}
                onClick={() => navigate(`/location/${loc.id}`)}
              />
            ))}
          </div>
          {favoriteLocationsList.length > 3 && (
            <button
              onClick={() => navigate('/locations')}
              className="btn btn-secondary"
              style={{ marginTop: '12px', width: '100%' }}
            >
              View All {favoriteLocationsList.length} Favorites
            </button>
          )}
        </div>
      )}
      
      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginTop: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <button onClick={() => navigate('/forecast')} className="btn btn-primary" style={{ width: '100%' }}>
            7-Day Forecast
          </button>
          <button onClick={() => navigate('/locations')} className="btn btn-secondary" style={{ width: '100%' }}>
            Browse Locations
          </button>
          <button onClick={() => navigate('/preferences')} className="btn btn-secondary" style={{ width: '100%' }}>
            Set Preferences
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;


