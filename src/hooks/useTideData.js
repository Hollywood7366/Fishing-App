import { useState, useEffect } from 'react';
import { getCurrentTide, getTideForecast } from '../services/tidesAPI';

export const useTideData = (lat, lng, refreshInterval = 1800000) => {
  const [currentTide, setCurrentTide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTide = async () => {
    if (!lat || !lng) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentTide(lat, lng);
      setCurrentTide(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tide:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTide();
    
    // Set up auto-refresh if interval provided (tides change more frequently)
    if (refreshInterval) {
      const interval = setInterval(fetchTide, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [lat, lng, refreshInterval]);

  return {
    currentTide,
    loading,
    error,
    lastUpdated,
    refresh: fetchTide
  };
};

export const useTideForecast = (lat, lng, days = 7) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!lat || !lng) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getTideForecast(lat, lng, days);
        setForecast(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching tide forecast:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [lat, lng, days]);

  return { forecast, loading, error };
};

export default useTideData;







