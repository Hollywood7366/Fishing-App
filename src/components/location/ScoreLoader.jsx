import React, { useEffect, useState } from 'react';
import { useLocationData } from '../../contexts/LocationDataContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { getCurrentWeather } from '../../services/weatherAPI';
import { getCurrentTide } from '../../services/tidesAPI';
import { calculateFishingScore } from '../../services/scoringEngine';
import { getMoonData } from '../../services/moonPhaseService';

/**
 * This component runs in the background to calculate scores for all locations
 * It updates the LocationDataContext with current scores
 */
const ScoreLoader = () => {
  const { getAllLocations, updateLocationScore } = useLocationData();
  const { getTargetSpeciesData } = useUserPreferences();
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const locations = getAllLocations();
  const targetSpecies = getTargetSpeciesData();

  useEffect(() => {
    const calculateScores = async () => {
      setIsLoading(true);
      setLoadedCount(0);
      
      // Calculate scores for each location
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        
        try {
          // Fetch data for this location
          const [weather, tide] = await Promise.all([
            getCurrentWeather(location.lat, location.lng),
            getCurrentTide(location.lat, location.lng)
          ]);
          
          const moonData = getMoonData();
          const date = new Date();
          
          // Calculate score (use first target species if available, otherwise general)
          const species = targetSpecies.length > 0 ? targetSpecies[0] : null;
          
          const conditions = {
            tide,
            weather,
            moonData,
            date
          };
          
          const scoreData = await calculateFishingScore(conditions, location, species);
          
          // Update the context with this score
          updateLocationScore(location.id, scoreData);
          
          setLoadedCount(i + 1);
        } catch (error) {
          console.error(`Error calculating score for ${location.name}:`, error);
          // Set a default score if error
          updateLocationScore(location.id, {
            overall: 70,
            rating: 'good',
            factors: {}
          });
        }
      }
      
      setIsLoading(false);
    };
    
    // Calculate scores on mount
    calculateScores();
    
    // Recalculate every hour
    const interval = setInterval(calculateScores, 3600000);
    
    return () => clearInterval(interval);
  }, [locations.length, targetSpecies.length]); // Recalculate if locations or species change

  // This component doesn't render anything visible
  return null;
};

export default ScoreLoader;


