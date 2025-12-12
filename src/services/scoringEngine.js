// Scoring Engine - Core algorithm that combines all factors
import { getCurrentSeason, scoreBarometricPressure, scoreWindConditions, estimateWaterTemp } from './weatherAPI';
import { scoreTideConditions } from './tidesAPI';
import { scoreMoonPhase } from './moonPhaseService';

// Factor weights (must sum to 100)
const WEIGHTS = {
  tide: 30,
  wind: 20,
  timeOfDay: 10,
  moon: 15,
  barometer: 10,
  waterTemp: 10,
  salinity: 5
};

// Score time of day for fishing (0-100)
export const scoreTimeOfDay = (date = new Date(), species = null) => {
  const hour = date.getHours();
  
  // Default scoring
  let score = 50;
  
  if (hour >= 5 && hour < 7) {
    score = 100; // Dawn - magic hour
  } else if (hour >= 7 && hour < 10) {
    score = 90; // Early morning
  } else if (hour >= 10 && hour < 14) {
    score = 55; // Midday
  } else if (hour >= 14 && hour < 17) {
    score = 65; // Afternoon
  } else if (hour >= 17 && hour < 19) {
    score = 100; // Dusk - magic hour
  } else if (hour >= 19 && hour < 22) {
    score = 80; // Early night
  } else {
    score = 70; // Late night
  }
  
  // Apply species-specific preferences if available
  if (species && species.preferences && species.preferences.timeOfDay) {
    const prefs = species.preferences.timeOfDay;
    if (hour >= 5 && hour < 7 && prefs.dawn) score = prefs.dawn;
    else if (hour >= 7 && hour < 11 && prefs.morning) score = prefs.morning;
    else if (hour >= 11 && hour < 14 && prefs.midday) score = prefs.midday;
    else if (hour >= 14 && hour < 17 && prefs.afternoon) score = prefs.afternoon;
    else if (hour >= 17 && hour < 19 && prefs.dusk) score = prefs.dusk;
    else if (hour >= 19 || hour < 5) score = prefs.night || 70;
  }
  
  return Math.max(0, Math.min(100, score));
};

// Score water temperature for species (0-100)
export const scoreWaterTemperature = (waterTemp, species = null) => {
  if (!species || !species.preferences || !species.preferences.waterTemp) {
    // Default scoring - most fish active 65-80°F
    if (waterTemp >= 65 && waterTemp <= 80) return 90;
    if (waterTemp >= 55 && waterTemp < 65) return 75;
    if (waterTemp > 80 && waterTemp <= 88) return 75;
    if (waterTemp >= 45 && waterTemp < 55) return 55;
    if (waterTemp > 88 && waterTemp <= 95) return 55;
    return 30;
  }
  
  const prefs = species.preferences.waterTemp;
  const [optimalMin, optimalMax] = prefs.optimal || [65, 80];
  const [goodMin, goodMax] = prefs.good || [55, 90];
  
  if (waterTemp >= optimalMin && waterTemp <= optimalMax) return 95;
  if (waterTemp >= goodMin && waterTemp <= goodMax) {
    // Linear falloff from optimal
    if (waterTemp < optimalMin) {
      return 70 + (waterTemp - goodMin) / (optimalMin - goodMin) * 25;
    } else {
      return 70 + (goodMax - waterTemp) / (goodMax - optimalMax) * 25;
    }
  }
  
  // Outside good range
  return 30;
};

// Score salinity for species (0-100)
export const scoreSalinity = (salinity, species = null, location = null) => {
  // Estimate salinity based on location water type if not provided
  if (!salinity && location) {
    switch (location.waterType) {
      case 'freshwater': salinity = 0; break;
      case 'brackish': salinity = 15; break;
      case 'saltwater': salinity = 30; break;
      default: salinity = 20;
    }
  }
  
  if (!species || !species.preferences || !species.preferences.salinity) {
    // Default - most species tolerate wide range
    return 80;
  }
  
  const prefs = species.preferences.salinity;
  const [optimalMin, optimalMax] = prefs.optimal || [10, 35];
  
  if (salinity >= optimalMin && salinity <= optimalMax) return 95;
  
  // Gradual falloff outside optimal
  const distance = Math.min(
    Math.abs(salinity - optimalMin),
    Math.abs(salinity - optimalMax)
  );
  
  return Math.max(30, 95 - distance * 5);
};

// Score season for species (0-100)
export const scoreSeason = (date = new Date(), species = null) => {
  const season = getCurrentSeason(date);
  
  if (!species || !species.preferences || !species.preferences.seasonalPatterns) {
    // Default - all seasons decent
    return 75;
  }
  
  return species.preferences.seasonalPatterns[season] || 70;
};

// Calculate overall fishing score (now async to support real water temp from CO-OPS)
export const calculateFishingScore = async (conditions, location, species = null) => {
  const {
    tide,
    weather,
    moonData,
    date = new Date(),
    previousPressure = null,
    waterTemp = null // Can be passed in if already fetched
  } = conditions;
  
  // Get water temperature (real from CO-OPS if available, otherwise estimate)
  let actualWaterTemp = waterTemp;
  if (actualWaterTemp === null) {
    actualWaterTemp = await estimateWaterTemp(weather.main.temp, getCurrentSeason(date), location.lat, location.lng);
  }
  
  // Calculate individual factor scores
  const scores = {
    tide: scoreTideConditions(tide.phase, tide.height, species),
    wind: scoreWindConditions(weather.wind.speed, weather.wind.deg, location.lat, location.lng),
    timeOfDay: scoreTimeOfDay(date, species),
    moon: scoreMoonPhase(date, species),
    barometer: scoreBarometricPressure(
      weather.main.pressure,
      previousPressure ? (weather.main.pressure > previousPressure ? 'rising' : 
                          weather.main.pressure < previousPressure ? 'falling' : 'stable') : 'stable'
    ),
    waterTemp: scoreWaterTemperature(actualWaterTemp, species),
    salinity: scoreSalinity(null, species, location),
    season: scoreSeason(date, species)
  };
  
  // Calculate weighted overall score
  let overallScore = 0;
  overallScore += scores.tide * (WEIGHTS.tide / 100);
  overallScore += scores.wind * (WEIGHTS.wind / 100);
  overallScore += scores.timeOfDay * (WEIGHTS.timeOfDay / 100);
  overallScore += scores.moon * (WEIGHTS.moon / 100);
  overallScore += scores.barometer * (WEIGHTS.barometer / 100);
  overallScore += scores.waterTemp * (WEIGHTS.waterTemp / 100);
  overallScore += scores.salinity * (WEIGHTS.salinity / 100);
  
  // Season affects overall but isn't a weighted factor
  // It's more of a multiplier
  const seasonMultiplier = scores.season / 100;
  overallScore = overallScore * (0.7 + seasonMultiplier * 0.3);
  
  return {
    overall: Math.round(overallScore),
    factors: scores,
    rating: getRating(overallScore),
    conditions: conditions // Include conditions for generating reasons
  };
};

// Get rating text from score
export const getRating = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
};

// Get rating display name
export const getRatingDisplay = (rating) => {
  const displays = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor'
  };
  return displays[rating] || 'Unknown';
};

// Get rating color class
export const getRatingColor = (rating) => {
  return `score-${rating}`;
};

// Get rating badge class
export const getRatingBadge = (rating) => {
  return `badge-${rating}`;
};

// Get factor explanation
export const getFactorExplanation = (factorName, score, conditions = null) => {
  const explanations = {
    tide: {
      excellent: 'Strong moving tide - fish are actively feeding',
      good: 'Good tidal movement providing feeding opportunities',
      fair: 'Moderate tide conditions',
      poor: 'Slack tide - fish less active'
    },
    wind: {
      excellent: 'Ideal wind conditions for fishing',
      good: 'Favorable winds with some chop to hide line',
      fair: 'Manageable wind conditions',
      poor: 'Strong winds making fishing difficult'
    },
    timeOfDay: {
      excellent: 'Prime feeding time - dawn or dusk magic hour',
      good: 'Good fishing time with active fish',
      fair: 'Decent time but not peak feeding period',
      poor: 'Slow time of day for fishing'
    },
    moon: {
      excellent: 'Major moon phase - fish are very active',
      good: 'Good moon phase for fishing',
      fair: 'Moderate moon influence',
      poor: 'Minor moon phase'
    },
    barometer: {
      excellent: 'Stable barometric pressure - optimal conditions',
      good: 'Favorable pressure with good bite',
      fair: 'Acceptable pressure conditions',
      poor: 'Pressure changes affecting fish behavior'
    },
    waterTemp: {
      excellent: 'Perfect water temperature for target species',
      good: 'Good water temperature range',
      fair: 'Acceptable but not ideal water temp',
      poor: 'Water too cold or too hot'
    },
    salinity: {
      excellent: 'Ideal salinity for target species',
      good: 'Good salinity levels',
      fair: 'Acceptable salinity',
      poor: 'Salinity not ideal for species'
    }
  };
  
  const rating = getRating(score);
  return explanations[factorName]?.[rating] || 'No explanation available';
};

// Get top reasons why the score is good (or why it's not)
export const getScoreReasons = (scoreData, conditions = null) => {
  if (!scoreData || !scoreData.factors) return [];
  
  const { factors, overall } = scoreData;
  const reasons = [];
  const factorIcons = {
    tide: '🌊',
    wind: '💨',
    timeOfDay: '🕐',
    moon: '🌙',
    barometer: '🔽',
    waterTemp: '🌡️',
    salinity: '💧'
  };
  
  const addReason = (text, bucket = reasons) => {
    if (text && !bucket.includes(text)) {
      bucket.push(text);
    }
  };
  
  // Sort factors by score (highest first)
  const sortedFactors = Object.entries(factors)
    .filter(([key]) => key !== 'season') // Exclude season as it's a multiplier
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  const overallRating = getRating(overall);

  const buildPositiveReasons = () => {
    const positive = [];
    const topFactors = sortedFactors.slice(0, 3);
    topFactors.forEach(([factorName, score]) => {
      const rating = getRating(score);
      if (rating === 'excellent' || rating === 'good') {
        let reason = '';
        if (factorName === 'tide' && conditions?.tide) {
          const tide = conditions.tide;
          if (tide.phase === 'falling') {
            reason = `${factorIcons[factorName]} Falling tide - fish are actively feeding`;
          } else if (tide.phase === 'rising') {
            reason = `${factorIcons[factorName]} Rising tide - good movement`;
          } else {
            reason = `${factorIcons[factorName]} ${getFactorExplanation(factorName, score)}`;
          }
        } else if (factorName === 'wind' && conditions?.weather) {
          const windSpeed = conditions.weather.wind?.speed || 0;
          if (windSpeed >= 6 && windSpeed <= 12) {
            reason = `${factorIcons[factorName]} Ideal wind speed (${Math.round(windSpeed)} mph)`;
          } else {
            reason = `${factorIcons[factorName]} ${getFactorExplanation(factorName, score)}`;
          }
        } else if (factorName === 'timeOfDay' && conditions?.date) {
          const hour = new Date(conditions.date).getHours();
          if (hour >= 5 && hour < 7) {
            reason = `${factorIcons[factorName]} Dawn magic hour - prime feeding time`;
          } else if (hour >= 17 && hour < 19) {
            reason = `${factorIcons[factorName]} Dusk magic hour - prime feeding time`;
          } else {
            reason = `${factorIcons[factorName]} ${getFactorExplanation(factorName, score)}`;
          }
        } else {
          reason = `${factorIcons[factorName]} ${getFactorExplanation(factorName, score)}`;
        }
        addReason(reason, positive);
      }
    });
    return positive;
  };

  const buildNegativeReasons = () => {
    const negative = [];
    const lowFactors = [...sortedFactors]
      .reverse() // lowest scores first
      .slice(0, 3);
    
    lowFactors.forEach(([factorName, score]) => {
      const rating = getRating(score);
      if (rating === 'excellent' || rating === 'good') return; // Skip positives here

      let reason = `${factorIcons[factorName]} ${getFactorExplanation(factorName, score)}`;
      
      if (factorName === 'wind' && conditions?.weather?.wind?.speed !== undefined) {
        const speed = Math.round(conditions.weather.wind.speed);
        reason = `${factorIcons[factorName]} Wind at ${speed} mph — ${speed > 15 ? 'choppy/drifty' : 'light and variable'} (${getFactorExplanation(factorName, score)})`;
      } else if (factorName === 'tide' && conditions?.tide?.phase) {
        const phase = conditions.tide.phase;
        reason = `${factorIcons[factorName]} ${phase === 'slack' ? 'Slack tide - little water movement' : `${phase} tide`} — ${getFactorExplanation(factorName, score)}`;
      } else if (factorName === 'barometer' && conditions?.weather?.main?.pressure) {
        reason = `${factorIcons[factorName]} Pressure ${Math.round(conditions.weather.main.pressure)} mb — ${getFactorExplanation(factorName, score)}`;
      } else if (factorName === 'timeOfDay' && conditions?.date) {
        const hour = new Date(conditions.date).getHours();
        if (hour >= 11 && hour < 16) {
          reason = `${factorIcons[factorName]} Midday lull — ${getFactorExplanation(factorName, score)}`;
        }
      }
      
      addReason(reason, negative);
    });

    return negative;
  };

  if (overallRating === 'fair' || overallRating === 'poor') {
    const negative = buildNegativeReasons();
    if (negative.length) {
      return negative.slice(0, 3);
    }
    return buildPositiveReasons().slice(0, 3);
  }

  return buildPositiveReasons().slice(0, 3);
};

// Calculate score for multiple days
export const calculateMultiDayScores = async (location, species, days = 7) => {
  const scores = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(8, 0, 0, 0); // Default to 8 AM for forecast
    
    // This would need actual API calls in real implementation
    // For now, return structure
    scores.push({
      date: date,
      score: null, // Would be calculated with real data
      rating: null
    });
  }
  
  return scores;
};

export default {
  calculateFishingScore,
  scoreTimeOfDay,
  scoreWaterTemperature,
  scoreSalinity,
  scoreSeason,
  getRating,
  getRatingDisplay,
  getRatingColor,
  getRatingBadge,
  getFactorExplanation,
  getScoreReasons,
  calculateMultiDayScores,
  WEIGHTS
};


