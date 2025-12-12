// LocalStorage utility for persisting user preferences

const STORAGE_KEYS = {
  PREFERENCES: 'fishing_app_preferences',
  FAVORITE_LOCATIONS: 'fishing_app_favorites',
  CUSTOM_LOCATIONS: 'fishing_app_custom_locations',
  NOTIFICATION_SETTINGS: 'fishing_app_notifications',
  CATCH_LOG: 'fishing_app_catches',
  USER_SPOTS: 'fishing_app_user_spots'
};

// Save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Load data from localStorage
const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// User Preferences
export const savePreferences = (preferences) => {
  return saveToStorage(STORAGE_KEYS.PREFERENCES, preferences);
};

export const loadPreferences = () => {
  return loadFromStorage(STORAGE_KEYS.PREFERENCES, {
    targetSpecies: [],
    units: {
      temperature: 'fahrenheit',
      speed: 'mph',
      distance: 'miles'
    },
    defaultView: 'dashboard',
    theme: 'light'
  });
};

// Favorite Locations
export const saveFavoriteLocations = (favorites) => {
  return saveToStorage(STORAGE_KEYS.FAVORITE_LOCATIONS, favorites);
};

export const loadFavoriteLocations = () => {
  return loadFromStorage(STORAGE_KEYS.FAVORITE_LOCATIONS, []);
};

export const addFavoriteLocation = (locationId) => {
  const favorites = loadFavoriteLocations();
  if (!favorites.includes(locationId)) {
    favorites.push(locationId);
    return saveFavoriteLocations(favorites);
  }
  return true;
};

export const removeFavoriteLocation = (locationId) => {
  const favorites = loadFavoriteLocations();
  const filtered = favorites.filter(id => id !== locationId);
  return saveFavoriteLocations(filtered);
};

export const isFavoriteLocation = (locationId) => {
  const favorites = loadFavoriteLocations();
  return favorites.includes(locationId);
};

// Custom Locations
export const saveCustomLocations = (locations) => {
  return saveToStorage(STORAGE_KEYS.CUSTOM_LOCATIONS, locations);
};

export const loadCustomLocations = () => {
  return loadFromStorage(STORAGE_KEYS.CUSTOM_LOCATIONS, []);
};

export const addCustomLocation = (location) => {
  const locations = loadCustomLocations();
  const newLocation = {
    ...location,
    id: `custom-${Date.now()}`,
    custom: true
  };
  locations.push(newLocation);
  saveCustomLocations(locations);
  return newLocation;
};

export const removeCustomLocation = (locationId) => {
  const locations = loadCustomLocations();
  const filtered = locations.filter(loc => loc.id !== locationId);
  return saveCustomLocations(filtered);
};

// Notification Settings
export const saveNotificationSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
};

export const loadNotificationSettings = () => {
  return loadFromStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, {
    enabled: false,
    threshold: 75,
    timeWindow: {
      start: 6,
      end: 20
    },
    locations: [],
    biteTimeAlerts: true,
    excellentConditionsAlert: true
  });
};

// Catch Log
export const saveCatches = (catches) => {
  return saveToStorage(STORAGE_KEYS.CATCH_LOG, catches);
};

export const loadCatches = () => {
  return loadFromStorage(STORAGE_KEYS.CATCH_LOG, []);
};

export const addCatch = (catchData) => {
  const catches = loadCatches();
  const newCatch = {
    ...catchData,
    id: `catch-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  catches.unshift(newCatch); // Add to beginning (newest first)
  saveCatches(catches);
  return newCatch;
};

export const updateCatch = (catchId, updates) => {
  const catches = loadCatches();
  const index = catches.findIndex(c => c.id === catchId);
  if (index !== -1) {
    catches[index] = { ...catches[index], ...updates, updatedAt: new Date().toISOString() };
    saveCatches(catches);
    return catches[index];
  }
  return null;
};

export const deleteCatch = (catchId) => {
  const catches = loadCatches();
  const filtered = catches.filter(c => c.id !== catchId);
  return saveCatches(filtered);
};

export const getCatchById = (catchId) => {
  const catches = loadCatches();
  return catches.find(c => c.id === catchId) || null;
};

export const getCatchStats = () => {
  const catches = loadCatches();
  const stats = {
    totalCatches: catches.length,
    speciesCounts: {},
    locationCounts: {},
    monthlyTrends: {},
    biggestCatch: null,
    recentCatches: catches.slice(0, 5)
  };
  
  catches.forEach(c => {
    // Count by species
    if (c.species) {
      stats.speciesCounts[c.species] = (stats.speciesCounts[c.species] || 0) + 1;
    }
    // Count by location
    if (c.locationId) {
      stats.locationCounts[c.locationId] = (stats.locationCounts[c.locationId] || 0) + 1;
    }
    // Monthly trends
    if (c.date) {
      const month = c.date.substring(0, 7); // YYYY-MM
      stats.monthlyTrends[month] = (stats.monthlyTrends[month] || 0) + 1;
    }
    // Track biggest catch by weight
    if (c.weight && (!stats.biggestCatch || c.weight > stats.biggestCatch.weight)) {
      stats.biggestCatch = c;
    }
  });
  
  return stats;
};

// =====================
// USER SPOTS (My Spots)
// =====================

export const saveUserSpots = (spots) => {
  return saveToStorage(STORAGE_KEYS.USER_SPOTS, spots);
};

export const loadUserSpots = () => {
  return loadFromStorage(STORAGE_KEYS.USER_SPOTS, []);
};

export const addUserSpot = (spotData) => {
  const spots = loadUserSpots();
  const newSpot = {
    ...spotData,
    id: `spot-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  spots.unshift(newSpot); // Add to beginning (newest first)
  saveUserSpots(spots);
  return newSpot;
};

export const updateUserSpot = (spotId, updates) => {
  const spots = loadUserSpots();
  const index = spots.findIndex(s => s.id === spotId);
  if (index !== -1) {
    spots[index] = { ...spots[index], ...updates, updatedAt: new Date().toISOString() };
    saveUserSpots(spots);
    return spots[index];
  }
  return null;
};

export const deleteUserSpot = (spotId) => {
  const spots = loadUserSpots();
  const filtered = spots.filter(s => s.id !== spotId);
  return saveUserSpots(filtered);
};

export const getUserSpotById = (spotId) => {
  const spots = loadUserSpots();
  return spots.find(s => s.id === spotId) || null;
};

export const getUserSpotsByLocation = (locationId) => {
  const spots = loadUserSpots();
  return spots.filter(s => s.parentLocationId === locationId);
};

export const getUserSpotStats = () => {
  const spots = loadUserSpots();
  return {
    totalSpots: spots.length,
    byStructure: spots.reduce((acc, spot) => {
      (spot.structure || []).forEach(s => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {}),
    byDepth: spots.reduce((acc, spot) => {
      if (spot.depth) {
        acc[spot.depth] = (acc[spot.depth] || 0) + 1;
      }
      return acc;
    }, {}),
    recentSpots: spots.slice(0, 5)
  };
};

// Clear all app data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  });
};

// Export storage keys for direct access if needed
export const KEYS = STORAGE_KEYS;

export default {
  savePreferences,
  loadPreferences,
  saveFavoriteLocations,
  loadFavoriteLocations,
  addFavoriteLocation,
  removeFavoriteLocation,
  isFavoriteLocation,
  saveCustomLocations,
  loadCustomLocations,
  addCustomLocation,
  removeCustomLocation,
  saveNotificationSettings,
  loadNotificationSettings,
  saveCatches,
  loadCatches,
  addCatch,
  updateCatch,
  deleteCatch,
  getCatchById,
  getCatchStats,
  // User Spots
  saveUserSpots,
  loadUserSpots,
  addUserSpot,
  updateUserSpot,
  deleteUserSpot,
  getUserSpotById,
  getUserSpotsByLocation,
  getUserSpotStats,
  clearAllData,
  KEYS
};
