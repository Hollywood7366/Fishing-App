// Weather API Service using NOAA Marine Weather (NWS) + CO-OPS
// Uses NOAA National Weather Service for weather data
// Uses NOAA CO-OPS for water temperature and salinity
// All free, no API keys required

const NOAA_NWS_BASE_URL = 'https://api.weather.gov';
const NOAA_COOPS_BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

// OpenWeatherMap as backup API
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Open-Meteo as third fallback (no API key required)
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Preferred forecast source order (used for checks/tests)
export const FORECAST_PRIORITY = ['noaa-nws', 'openweathermap', 'open-meteo', 'fallback-stub'];

// CO-OPS station IDs for South Louisiana (same as tide stations)
const COOPS_STATIONS = {
  'grand-isle': '8761724',
  'shell-beach': '8761305',
  'new-canal': '8761927',
  'calcasieu-pass': '8768094',
  'lawma': '8764227',
  'pilots-station-east': '8760922'
};

// Get closest CO-OPS station for a location
const getClosestStation = (lat, lng) => {
  if (lng < -90.5) return COOPS_STATIONS['calcasieu-pass'];
  if (lng > -89.5) return COOPS_STATIONS['shell-beach'];
  if (lat > 30.0) return COOPS_STATIONS['new-canal'];
  return COOPS_STATIONS['grand-isle'];
};

// Get NWS grid point from lat/lng (required for marine weather)
const getNWSGridPoint = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOAA_NWS_BASE_URL}/points/${lat},${lng}`,
      {
        headers: {
          'User-Agent': 'SouthLAFishingApp/1.0', // NWS requires User-Agent
          'Accept': 'application/json'
        }
      }
    );
    if (!response.ok) throw new Error('Failed to get grid point');
    const data = await response.json();
    return {
      gridId: data.properties.gridId,
      gridX: data.properties.gridX,
      gridY: data.properties.gridY,
      forecastOffice: data.properties.cwa,
      observationStationsUrl: data.properties.observationStations
    };
  } catch (error) {
    console.error('Error getting NWS grid point:', error);
    return null;
  }
};

// Fallback: Get weather from OpenWeatherMap
const getOpenWeatherMapData = async (lat, lng) => {
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'demo') {
    throw new Error('OpenWeatherMap API key not configured');
  }

  const response = await fetch(
    `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
  );
  
  if (!response.ok) throw new Error('OpenWeatherMap API request failed');
  
  const data = await response.json();
  return {
    ...data,
    _source: 'openweathermap'
  };
};

// Fallback: Get weather from Open-Meteo (no API key required)
const getOpenMeteoData = async (lat, lng) => {
  const url = `${OPEN_METEO_BASE_URL}?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Open-Meteo request failed');

  const data = await response.json();
  const c = data.current || {};

  return {
    coord: { lat, lon: lng },
    weather: [{
      id: 800,
      main: (c.cloud_cover ?? 0) > 50 ? 'Clouds' : 'Clear',
      description: (c.cloud_cover ?? 0) > 50 ? 'cloudy' : 'clear sky',
      icon: '01d'
    }],
    main: {
      temp: c.temperature_2m ?? 75,
      feels_like: c.apparent_temperature ?? c.temperature_2m ?? 75,
      pressure: c.pressure_msl ?? 1013,
      humidity: c.relative_humidity_2m ?? 60
    },
    wind: {
      speed: c.wind_speed_10m ?? 8,
      deg: c.wind_direction_10m ?? 0
    },
    clouds: { all: c.cloud_cover ?? 0 },
    dt: (c.time ? new Date(c.time).getTime() : Date.now()) / 1000,
    _source: 'open-meteo'
  };
};

export const getCurrentWeather = async (lat, lng) => {
  try {
    const gridPoint = await getNWSGridPoint(lat, lng);
    if (!gridPoint) throw new Error('Could not get NWS grid point');

    // Get current observations (gridpoint first, station fallback)
    let latestObs = null;

    const obsUrl = `${NOAA_NWS_BASE_URL}/gridpoints/${gridPoint.gridId}/${gridPoint.gridX},${gridPoint.gridY}/observations`;
    const obsResponse = await fetch(
      obsUrl,
      {
        headers: {
          'User-Agent': 'SouthLAFishingApp/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (obsResponse.status === 404 && gridPoint.observationStationsUrl) {
      const stationsResp = await fetch(gridPoint.observationStationsUrl, {
        headers: {
          'User-Agent': 'SouthLAFishingApp/1.0',
          'Accept': 'application/json'
        }
      });
      if (stationsResp.ok) {
        const stations = await stationsResp.json();
        const firstStationUrl = stations.features?.[0]?.id;
        if (firstStationUrl) {
          const latestStationResp = await fetch(`${firstStationUrl}/observations/latest`, {
            headers: {
              'User-Agent': 'SouthLAFishingApp/1.0',
              'Accept': 'application/json'
            }
          });
          if (latestStationResp.ok) {
            const stationData = await latestStationResp.json();
            latestObs = stationData.properties || null;
          }
        }
      }
    } else if (obsResponse.ok) {
      const obsData = await obsResponse.json();
      latestObs = obsData.features?.[0]?.properties || null;
    }

    if (!latestObs) throw new Error('No observations available');

    // Convert temperature from Celsius to Fahrenheit if needed
    const tempC = latestObs.temperature?.value;
    const tempF = tempC ? (tempC * 9/5) + 32 : 75;
    
    // Convert pressure from Pa to mb (millibars)
    const pressurePa = latestObs.barometricPressure?.value;
    const pressureMb = pressurePa ? pressurePa / 100 : 1013;
    
    // Convert wind speed from m/s to mph
    const windSpeedMs = latestObs.windSpeed?.value;
    const windSpeedMph = windSpeedMs ? windSpeedMs * 2.237 : 8;
    
    // Convert to OpenWeatherMap-like format for compatibility
    return {
      coord: { lat, lon: lng },
      weather: [{
        id: 800,
        main: latestObs.textDescription?.toLowerCase().includes('cloud') ? 'Clouds' : 'Clear',
        description: latestObs.textDescription || 'clear sky',
        icon: '01d'
      }],
      main: {
        temp: Math.round(tempF),
        feels_like: Math.round(tempF), // NWS doesn't provide feels_like, use same as temp
        pressure: Math.round(pressureMb),
        humidity: Math.round(latestObs.relativeHumidity?.value || 60)
      },
      wind: {
        speed: Math.round(windSpeedMph * 10) / 10, // Round to 1 decimal
        deg: Math.round(latestObs.windDirection?.value || 0)
      },
      clouds: { 
        all: latestObs.cloudLayers?.[0]?.coverage?.value || 0 
      },
      dt: new Date(latestObs.timestamp).getTime() / 1000,
      _source: 'noaa-nws'
    };
  } catch (noaaError) {
    console.warn('Error fetching NOAA marine weather:', noaaError);
    
    // Try OpenWeatherMap as backup
    try {
      const data = await getOpenWeatherMapData(lat, lng);
      return data;
    } catch (owmError) {
      console.warn('Error fetching OpenWeatherMap data:', owmError);
      // Try Open-Meteo as third fallback (no key required)
      try {
        const data = await getOpenMeteoData(lat, lng);
        return data;
      } catch (omError) {
        console.warn('Error fetching Open-Meteo data:', omError);
        // Final minimal stub to keep app responsive
        return {
          coord: { lat, lon: lng },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
          main: { temp: 75, feels_like: 75, pressure: 1013, humidity: 60 },
          wind: { speed: 8, deg: 0 },
          clouds: { all: 0 },
          dt: Date.now() / 1000,
          _source: 'fallback-stub'
        };
      }
    }
  }
};

export const getWeatherForecast = async (lat, lng, days = 7) => {
  try {
    const gridPoint = await getNWSGridPoint(lat, lng);
    if (!gridPoint) throw new Error('Could not get NWS grid point');

    const forecastResponse = await fetch(
      `${NOAA_NWS_BASE_URL}/gridpoints/${gridPoint.gridId}/${gridPoint.gridX},${gridPoint.gridY}/forecast`,
      {
        headers: {
          'User-Agent': 'SouthLAFishingApp/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    if (!forecastResponse.ok) throw new Error('Forecast API request failed');
    const forecastData = await forecastResponse.json();
    
    const periods = forecastData.properties?.periods || [];
    const forecast = periods.slice(0, days * 2).map((period, index) => {
      const temp = period.temperature || 75;
      const pressure = 1013 + Math.sin(index / 3) * 10;
      const windSpeed = period.windSpeed?.split(' ')[0] || 8;
      
      return {
        dt: new Date(period.startTime).getTime() / 1000,
        temp: temp,
        feels_like: temp,
        pressure: pressure,
        humidity: 60 + Math.random() * 30,
        wind_speed: parseFloat(windSpeed) || 8,
        wind_deg: 0,
        clouds: period.isDaytime ? 50 : 0,
        weather: [{
          id: 800,
          main: period.shortForecast || 'Clear',
          description: period.detailedForecast || 'clear sky',
          icon: '01d'
        }]
      };
    });
    
    return {
      list: forecast,
      _source: 'noaa-nws'
    };
  } catch (noaaError) {
    console.warn('Error fetching NOAA forecast:', noaaError);
    
    // Try OpenWeatherMap as backup
    const owmEnabled = OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'demo';
    if (owmEnabled) {
      try {
        const response = await fetch(
          `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=imperial&cnt=${days * 8}`
        );
        if (!response.ok) throw new Error('OpenWeatherMap forecast failed');
        const data = await response.json();
        return {
          ...data,
          _source: 'openweathermap'
        };
      } catch (owmError) {
        console.warn('Error fetching OpenWeatherMap forecast:', owmError);
      }
    }

    // Try Open-Meteo as third fallback (no key)
    try {
      // Open-Meteo forecast: hourly to approximate multi-day
      const url = `${OPEN_METEO_BASE_URL}?latitude=${lat}&longitude=${lng}` +
        `&hourly=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover` +
        `&forecast_days=${Math.min(days, 7)}`;

      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Open-Meteo forecast failed');
      const data = await resp.json();
      const times = data.hourly?.time || [];
      const temps = data.hourly?.temperature_2m || [];
      const hums = data.hourly?.relative_humidity_2m || [];
      const presses = data.hourly?.pressure_msl || [];
      const winds = data.hourly?.wind_speed_10m || [];
      const windDirs = data.hourly?.wind_direction_10m || [];
      const clouds = data.hourly?.cloud_cover || [];

      const list = times.map((t, i) => ({
        dt: new Date(t).getTime() / 1000,
        temp: temps[i] ?? 75,
        feels_like: temps[i] ?? 75,
        pressure: presses[i] ?? 1013,
        humidity: hums[i] ?? 60,
        wind_speed: winds[i] ?? 8,
        wind_deg: windDirs[i] ?? 0,
        clouds: { all: clouds[i] ?? 0 },
        weather: [{
          id: 800,
          main: (clouds[i] ?? 0) > 50 ? 'Clouds' : 'Clear',
          description: (clouds[i] ?? 0) > 50 ? 'cloudy' : 'clear sky',
          icon: '01d'
        }]
      }));

      return { list, _source: 'open-meteo' };
    } catch (omError) {
      console.warn('Error fetching Open-Meteo forecast:', omError);
      // Final minimal stub to keep app responsive
      const now = Date.now();
      const list = Array.from({ length: days * 2 }, (_, idx) => ({
        dt: (now / 1000) + idx * 43200, // 12h steps
        temp: 75,
        feels_like: 75,
        pressure: 1013,
        humidity: 60,
        wind_speed: 8,
        wind_deg: 0,
        clouds: { all: 0 },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }]
      }));
      return { list, _source: 'fallback-stub' };
    }
  }
};

// Calculate barometric pressure trend
export const getBarometricTrend = (currentPressure, previousPressure) => {
  const diff = currentPressure - previousPressure;
  
  if (Math.abs(diff) < 2) return 'stable';
  if (diff > 0) return 'rising';
  return 'falling';
};

// Score barometric pressure for fishing (0-100)
export const scoreBarometricPressure = (pressure, trend) => {
  let score = 50; // Base score
  
  // Optimal pressure range
  if (pressure >= 1010 && pressure <= 1020) {
    score = 90;
  } else if (pressure >= 1005 && pressure < 1010) {
    score = 75;
  } else if (pressure > 1020 && pressure <= 1025) {
    score = 75;
  } else if (pressure < 1005 || pressure > 1025) {
    score = 50;
  }
  
  // Adjust for trend
  if (trend === 'stable') score += 10;
  if (trend === 'rising') score += 5;
  if (trend === 'falling') score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Score wind conditions for fishing (0-100)
export const scoreWindConditions = (windSpeed, windDirection, locationLat, locationLng) => {
  let score = 100;
  
  // Wind speed scoring
  if (windSpeed <= 5) {
    score = 85; // Very light - good but some chop helps
  } else if (windSpeed <= 12) {
    score = 100; // Ideal
  } else if (windSpeed <= 18) {
    score = 75; // Manageable
  } else if (windSpeed <= 25) {
    score = 50; // Challenging
  } else {
    score = 25; // Difficult conditions
  }
  
  // Could adjust based on wind direction relative to location
  // For now, keeping it simple
  
  return Math.max(0, Math.min(100, score));
};

// Get water temperature from CO-OPS (real data!)
export const getWaterTemperature = async (lat, lng) => {
  try {
    const station = getClosestStation(lat, lng);
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    const response = await fetch(
      `${NOAA_COOPS_BASE_URL}?` +
      `begin_date=${dateStr}&` +
      `end_date=${dateStr}&` +
      `station=${station}&` +
      `product=water_temperature&` +
      `units=english&` +
      `time_zone=lst_ldt&` +
      `format=json`
    );
    
    if (!response.ok) throw new Error('CO-OPS API request failed');
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No water temperature data available');
    }
    
    // Get most recent reading
    const latestReading = data.data[data.data.length - 1];
    return parseFloat(latestReading.v);
  } catch (error) {
    console.error('Error fetching water temperature from CO-OPS:', error);
    return null; // Return null to indicate we should fall back to estimate
  }
};

// Get water temperature estimate (fallback if CO-OPS unavailable)
export const estimateWaterTemp = async (airTemp, season, lat, lng) => {
  // Try to get real water temp from CO-OPS first
  const realWaterTemp = await getWaterTemperature(lat, lng);
  if (realWaterTemp !== null) {
    return Math.round(realWaterTemp);
  }
  
  // Fallback: estimate from air temp
  let waterTemp = airTemp;
  if (season === 'spring') waterTemp = airTemp * 0.85;
  if (season === 'summer') waterTemp = airTemp * 0.95;
  if (season === 'fall') waterTemp = airTemp * 0.90;
  if (season === 'winter') waterTemp = airTemp * 0.80;
  
  return Math.round(waterTemp);
};

// Get salinity from CO-OPS (if available)
export const getSalinity = async (lat, lng) => {
  try {
    const station = getClosestStation(lat, lng);
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    const response = await fetch(
      `${NOAA_COOPS_BASE_URL}?` +
      `begin_date=${dateStr}&` +
      `end_date=${dateStr}&` +
      `station=${station}&` +
      `product=salinity&` +
      `units=english&` +
      `time_zone=lst_ldt&` +
      `format=json`
    );
    
    if (!response.ok) throw new Error('CO-OPS API request failed');
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return null; // Salinity not available for this station
    }
    
    // Get most recent reading
    const latestReading = data.data[data.data.length - 1];
    return parseFloat(latestReading.v);
  } catch (error) {
    // Salinity not available for most stations, this is expected
    return null;
  }
};

// Get current season
export const getCurrentSeason = (date = new Date()) => {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

export default {
  getCurrentWeather,
  getWeatherForecast,
  getBarometricTrend,
  scoreBarometricPressure,
  scoreWindConditions,
  estimateWaterTemp,
  getWaterTemperature,
  getSalinity,
  getCurrentSeason
};


