import { useState, useEffect } from 'react';
import { getCurrentWeather, getWeatherForecast } from '../services/weatherAPI';

export const useWeatherData = (lat, lng, refreshInterval = 3600000) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeather = async () => {
    if (!lat || !lng) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentWeather(lat, lng);
      setCurrentWeather(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Set up auto-refresh if interval provided
    if (refreshInterval) {
      const interval = setInterval(fetchWeather, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [lat, lng, refreshInterval]);

  return {
    currentWeather,
    loading,
    error,
    lastUpdated,
    refresh: fetchWeather
  };
};

export const useWeatherForecast = (lat, lng, days = 7) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!lat || !lng) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getWeatherForecast(lat, lng, days);
        setForecast(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching forecast:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [lat, lng, days]);

  return { forecast, loading, error };
};

export default useWeatherData;







