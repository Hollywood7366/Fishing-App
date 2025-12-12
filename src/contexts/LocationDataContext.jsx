import React, { createContext, useContext, useState, useEffect } from 'react';
import locationsData from '../data/locations.json';
import publicReefs from '../data/publicReefs.json';
import { loadCustomLocations, saveCustomLocations } from '../utils/localStorage';

const LocationDataContext = createContext();

export const useLocationData = () => {
  const context = useContext(LocationDataContext);
  if (!context) {
    throw new Error('useLocationData must be used within LocationDataProvider');
  }
  return context;
};

export const LocationDataProvider = ({ children }) => {
  // Load locations data (includes 40+ fishing spots)
  const [preloadedLocations] = useState(locationsData);
  const [customLocations, setCustomLocations] = useState(loadCustomLocations());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Get all locations (preloaded + custom)
  const getAllLocations = () => {
    return [...preloadedLocations, ...customLocations];
  };

  // Get location by ID
  const getLocationById = (id) => {
    return getAllLocations().find(loc => loc.id === id);
  };

  // Get unique regions
  const getRegions = () => {
    const regions = new Set(preloadedLocations.map(loc => loc.region));
    return ['all', ...Array.from(regions).sort()];
  };

  // Filter locations by region
  const getLocationsByRegion = (region) => {
    if (region === 'all') return getAllLocations();
    return getAllLocations().filter(loc => loc.region === region);
  };

  // Search locations
  const searchLocations = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return getAllLocations().filter(loc => 
      loc.name.toLowerCase().includes(lowercaseQuery) ||
      loc.region.toLowerCase().includes(lowercaseQuery) ||
      (loc.description && loc.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Filter by target species
  const getLocationsBySpecies = (speciesId) => {
    return getAllLocations().filter(loc => 
      loc.targetSpecies && loc.targetSpecies.includes(speciesId)
    );
  };

  // Add custom location
  const addCustomLocation = (location) => {
    const newLocation = {
      ...location,
      id: `custom-${Date.now()}`,
      custom: true,
      targetSpecies: location.targetSpecies || [],
      facilities: location.facilities || []
    };
    
    const updated = [...customLocations, newLocation];
    setCustomLocations(updated);
    saveCustomLocations(updated);
    return newLocation;
  };

  // Remove custom location
  const removeCustomLocation = (locationId) => {
    const updated = customLocations.filter(loc => loc.id !== locationId);
    setCustomLocations(updated);
    saveCustomLocations(updated);
  };

  // Update custom location
  const updateCustomLocation = (locationId, updates) => {
    const updated = customLocations.map(loc => 
      loc.id === locationId ? { ...loc, ...updates } : loc
    );
    setCustomLocations(updated);
    saveCustomLocations(updated);
  };

  // Check if location is custom
  const isCustomLocation = (locationId) => {
    return locationId && locationId.startsWith('custom-');
  };

  // Get locations with scores (would be populated by scoring engine)
  const [locationScores, setLocationScores] = useState({});

  // Public reefs (seeded) - read-only
  const getPublicReefs = () => publicReefs;

  const updateLocationScore = (locationId, scoreData) => {
    setLocationScores(prev => ({
      ...prev,
      [locationId]: scoreData
    }));
  };

  const getLocationScore = (locationId) => {
    return locationScores[locationId];
  };

  // Get top locations by score
  const getTopLocations = (limit = 3) => {
    const locationsWithScores = getAllLocations()
      .map(loc => ({
        ...loc,
        scoreData: locationScores[loc.id]
      }))
      .filter(loc => loc.scoreData && loc.scoreData.overall)
      .sort((a, b) => b.scoreData.overall - a.scoreData.overall);
    
    return locationsWithScores.slice(0, limit);
  };

  const value = {
    // Locations
    preloadedLocations,
    customLocations,
    getAllLocations,
    getLocationById,
    
    // Regions
    getRegions,
    selectedRegion,
    setSelectedRegion,
    getLocationsByRegion,
    
    // Search & Filter
    searchLocations,
    getLocationsBySpecies,
    
    // Custom locations
    addCustomLocation,
    removeCustomLocation,
    updateCustomLocation,
    isCustomLocation,
    
    // Selection
    selectedLocation,
    setSelectedLocation,
    
    // Scoring
    locationScores,
    updateLocationScore,
    getLocationScore,
    getTopLocations,

    // Public reefs
    getPublicReefs
  };

  return (
    <LocationDataContext.Provider value={value}>
      {children}
    </LocationDataContext.Provider>
  );
};

export default LocationDataContext;


