import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationData } from '../../contexts/LocationDataContext';
import LocationCard from './LocationCard';

const LocationList = ({ 
  selectedLocationId = '', 
  selectedRegion = 'all', 
  sortBy = 'name',
  depthFilter = 'all',
  structureFilter = 'all',
  accessFilter = 'all'
}) => {
  const navigate = useNavigate();
  const { 
    getAllLocations, 
    getLocationsByRegion, 
    getLocationScore 
  } = useLocationData();
  
  // Get locations based on region filter
  let locations = selectedRegion === 'all' ? getAllLocations() : getLocationsByRegion(selectedRegion);
  
  // Filter by selected location if provided
  if (selectedLocationId && selectedLocationId.length > 0) {
    locations = locations.filter(loc => loc.id === selectedLocationId);
  }
  
  // Apply depth filter
  if (depthFilter !== 'all') {
    locations = locations.filter(loc => loc.depth === depthFilter);
  }
  
  // Apply structure filter
  if (structureFilter !== 'all') {
    locations = locations.filter(loc => loc.structure?.includes(structureFilter));
  }
  
  // Apply access filter
  if (accessFilter !== 'all') {
    locations = locations.filter(loc => loc.access?.includes(accessFilter));
  }
  
  // Apply sorting
  locations = [...locations].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = getLocationScore(a.id)?.overall || 0;
      const scoreB = getLocationScore(b.id)?.overall || 0;
      return scoreB - scoreA;
    }
    // Default: sort by name
    return a.name.localeCompare(b.name);
  });
  
  const handleLocationClick = (location) => {
    navigate(`/location/${location.id}`);
  };
  
  if (locations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎣</div>
        <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>No locations found</p>
        <p style={{ fontSize: '14px', margin: 0 }}>Try adjusting your filters</p>
      </div>
    );
  }
  
  return (
    <div>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '16px',
        fontSize: '14px'
      }}>
        Found {locations.length} location{locations.length !== 1 ? 's' : ''}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {locations.map(location => (
          <LocationCard
            key={location.id}
            location={location}
            scoreData={getLocationScore(location.id)}
            onClick={() => handleLocationClick(location)}
          />
        ))}
      </div>
    </div>
  );
};

export default LocationList;
