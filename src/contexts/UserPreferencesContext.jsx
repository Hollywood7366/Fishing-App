import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loadPreferences,
  savePreferences,
  loadFavoriteLocations,
  saveFavoriteLocations,
  loadNotificationSettings,
  saveNotificationSettings
} from '../utils/localStorage';
import speciesData from '../data/species.json';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(loadPreferences());
  const [favoriteLocations, setFavoriteLocations] = useState(loadFavoriteLocations());
  const [notificationSettings, setNotificationSettings] = useState(loadNotificationSettings());
  const [availableSpecies] = useState(speciesData);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    saveFavoriteLocations(favoriteLocations);
  }, [favoriteLocations]);

  useEffect(() => {
    saveNotificationSettings(notificationSettings);
  }, [notificationSettings]);

  // Update general preferences
  const updatePreferences = (updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  // Target species management
  const addTargetSpecies = (speciesId) => {
    if (!preferences.targetSpecies.includes(speciesId)) {
      setPreferences(prev => ({
        ...prev,
        targetSpecies: [...prev.targetSpecies, speciesId]
      }));
    }
  };

  const removeTargetSpecies = (speciesId) => {
    setPreferences(prev => ({
      ...prev,
      targetSpecies: prev.targetSpecies.filter(id => id !== speciesId)
    }));
  };

  const toggleTargetSpecies = (speciesId) => {
    if (preferences.targetSpecies.includes(speciesId)) {
      removeTargetSpecies(speciesId);
    } else {
      addTargetSpecies(speciesId);
    }
  };

  const isTargetSpecies = (speciesId) => {
    return preferences.targetSpecies.includes(speciesId);
  };

  const getTargetSpeciesData = () => {
    return availableSpecies.filter(s => preferences.targetSpecies.includes(s.id));
  };

  // Favorite locations management
  const addFavorite = (locationId) => {
    if (!favoriteLocations.includes(locationId)) {
      setFavoriteLocations(prev => [...prev, locationId]);
    }
  };

  const removeFavorite = (locationId) => {
    setFavoriteLocations(prev => prev.filter(id => id !== locationId));
  };

  const toggleFavorite = (locationId) => {
    if (favoriteLocations.includes(locationId)) {
      removeFavorite(locationId);
    } else {
      addFavorite(locationId);
    }
  };

  const isFavorite = (locationId) => {
    return favoriteLocations.includes(locationId);
  };

  // Notification settings management
  const updateNotificationSettings = (updates) => {
    setNotificationSettings(prev => ({ ...prev, ...updates }));
  };

  const addNotificationLocation = (locationId) => {
    if (!notificationSettings.locations.includes(locationId)) {
      setNotificationSettings(prev => ({
        ...prev,
        locations: [...prev.locations, locationId]
      }));
    }
  };

  const removeNotificationLocation = (locationId) => {
    setNotificationSettings(prev => ({
      ...prev,
      locations: prev.locations.filter(id => id !== locationId)
    }));
  };

  const value = {
    preferences,
    updatePreferences,
    
    // Species
    availableSpecies,
    targetSpecies: preferences.targetSpecies,
    addTargetSpecies,
    removeTargetSpecies,
    toggleTargetSpecies,
    isTargetSpecies,
    getTargetSpeciesData,
    
    // Favorites
    favoriteLocations,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    
    // Notifications
    notificationSettings,
    updateNotificationSettings,
    addNotificationLocation,
    removeNotificationLocation
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;







