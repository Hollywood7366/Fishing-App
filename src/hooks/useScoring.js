import { useState, useEffect } from 'react';
import { calculateFishingScore } from '../services/scoringEngine';
import { getMoonData } from '../services/moonPhaseService';

export const useScoring = (location, weather, tide, species = null, date = null) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location || !weather || !tide) {
      setLoading(false);
      return;
    }

    const calculateScore = async () => {
      try {
        setLoading(true);
        
        const currentDate = date || new Date();
        const moonData = getMoonData(currentDate, location.lat, location.lng);
        
        const conditions = {
          tide,
          weather,
          moonData,
          date: currentDate
        };
        
        const scoreData = await calculateFishingScore(conditions, location, species);
        setScore(scoreData);
      } catch (error) {
        console.error('Error calculating score:', error);
        setScore(null);
      } finally {
        setLoading(false);
      }
    };

    calculateScore();
  }, [location, weather, tide, species, date]);

  return { score, loading };
};

export default useScoring;


