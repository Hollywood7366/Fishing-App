// NOAA Tides & Currents API Service
// Uses real NOAA data when available, falls back to calculated predictions

const NOAA_BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

// NOAA station IDs for South Louisiana
const TIDE_STATIONS = {
  'grand-isle': '8761724',
  'shell-beach': '8761305',
  'new-canal': '8761927',
  'calcasieu-pass': '8768094',
  'lawma': '8764227',
  'pilots-station-east': '8760922'
};

// Get closest tide station for a location
const getClosestStation = (lat, lng) => {
  // Simplified - match to general regions
  if (lng < -90.5) return TIDE_STATIONS['calcasieu-pass'];
  if (lng > -89.5) return TIDE_STATIONS['shell-beach'];
  if (lat > 30.0) return TIDE_STATIONS['new-canal'];
  return TIDE_STATIONS['grand-isle'];
};

// Generate mock tide data based on lunar cycle
const generateMockTides = (date, lat, lng) => {
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  
  // Simulate semi-diurnal tides (2 highs, 2 lows per day)
  const phase = (hour / 24) * 2 * Math.PI + (dayOfMonth / 30) * Math.PI;
  const tideHeight = 1.5 + Math.sin(phase) * 1.2;
  
  // Determine tide phase
  const derivative = Math.cos(phase);
  let tidePhase;
  if (Math.abs(derivative) < 0.3) {
    tidePhase = tideHeight > 1.5 ? 'high' : 'low';
  } else {
    tidePhase = derivative > 0 ? 'rising' : 'falling';
  }
  
  return {
    height: tideHeight.toFixed(2),
    phase: tidePhase,
    time: date.toISOString(),
    _mock: true
  };
};

// Get current tide data
export const getCurrentTide = async (lat, lng, date = new Date()) => {
  try {
    const station = getClosestStation(lat, lng);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    const response = await fetch(
      `${NOAA_BASE_URL}?` +
      `begin_date=${dateStr}&` +
      `end_date=${dateStr}&` +
      `station=${station}&` +
      `product=predictions&` +
      `datum=MLLW&` +
      `time_zone=lst_ldt&` +
      `units=english&` +
      `interval=hilo&` +
      `format=json`
    );
    
    if (!response.ok) throw new Error('NOAA API request failed');
    
    const data = await response.json();
    
    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No tide data available');
    }
    
    // Find current/next tide
    const now = date.getTime();
    const predictions = data.predictions.map(p => ({
      time: new Date(p.t).getTime(),
      height: parseFloat(p.v),
      type: p.type === 'H' ? 'high' : 'low'
    }));
    
    // Determine current phase
    let currentPhase = 'slack';
    let currentHeight = 0;
    
    for (let i = 0; i < predictions.length - 1; i++) {
      if (predictions[i].time <= now && predictions[i + 1].time > now) {
        currentHeight = predictions[i].height + 
          (predictions[i + 1].height - predictions[i].height) * 
          ((now - predictions[i].time) / (predictions[i + 1].time - predictions[i].time));
        
        if (predictions[i + 1].type === 'high') {
          currentPhase = 'rising';
        } else {
          currentPhase = 'falling';
        }
        break;
      }
    }
    
    return {
      height: currentHeight.toFixed(2),
      phase: currentPhase,
      time: date.toISOString(),
      predictions: predictions.slice(0, 4), // Next 4 tide events
      station: station
    };
  } catch (error) {
    console.warn('Error fetching tide data:', error);
    throw error;
  }
};

// Get tide predictions for multiple days
export const getTideForecast = async (lat, lng, days = 7) => {
  try {
    const station = getClosestStation(lat, lng);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const response = await fetch(
      `${NOAA_BASE_URL}?` +
      `begin_date=${startStr}&` +
      `end_date=${endStr}&` +
      `station=${station}&` +
      `product=predictions&` +
      `datum=MLLW&` +
      `time_zone=lst_ldt&` +
      `units=english&` +
      `interval=hilo&` +
      `format=json`
    );
    
    if (!response.ok) throw new Error('NOAA API request failed');
    
    const data = await response.json();
    
    if (!data.predictions) throw new Error('No predictions available');
    
    return {
      predictions: data.predictions.map(p => ({
        time: p.t,
        height: parseFloat(p.v),
        type: p.type === 'H' ? 'high' : 'low'
      })),
      station: station
    };
  } catch (error) {
    console.warn('Error fetching tide forecast:', error);
    throw error;
  }
};

// Score tide conditions for fishing (0-100)
export const scoreTideConditions = (tidePhase, tideHeight, species = null) => {
  let score = 50; // Base score
  
  // General tide phase scoring
  switch (tidePhase) {
    case 'rising':
      score = 85;
      break;
    case 'falling':
      score = 90; // Generally best
      break;
    case 'high':
      score = 60;
      break;
    case 'low':
      score = 55;
      break;
    case 'slack':
    default:
      // Slack tide = minimal movement = tough bite
      score = 20;
  }
  
  // Adjust for species if provided
  if (species && species.preferences && species.preferences.tidePhase) {
    const prefs = species.preferences.tidePhase;
    if (tidePhase === 'rising' && prefs.incoming) {
      score = prefs.incoming;
    } else if (tidePhase === 'falling' && prefs.outgoing) {
      score = prefs.outgoing;
    } else if ((tidePhase === 'high' || tidePhase === 'low') && prefs.slack) {
      score = prefs.slack;
    }
  }
  
  // Extreme tides can be less productive
  if (tideHeight > 3.5) score -= 10;
  if (tideHeight < 0.5) score -= 15;
  
  return Math.max(0, Math.min(100, score));
};

// Calculate tide strength (how fast it's moving)
export const getTideStrength = (currentHeight, nextHeight, hoursUntilNext) => {
  const change = Math.abs(nextHeight - currentHeight);
  const rate = change / hoursUntilNext;
  
  if (rate > 0.5) return 'strong';
  if (rate > 0.25) return 'moderate';
  return 'weak';
};

export default {
  getCurrentTide,
  getTideForecast,
  scoreTideConditions,
  getTideStrength,
  TIDE_STATIONS
};


