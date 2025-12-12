// Moon Phase Calculation Service
// Uses astronomical calculations to determine moon phase and position

// Calculate moon phase (0 = new moon, 0.5 = full moon, 1 = new moon)
export const getMoonPhase = (date = new Date()) => {
  // Known new moon date
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarMonth = 29.53058867; // days
  
  const daysSinceKnownNew = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceKnownNew % lunarMonth) / lunarMonth;
  
  return phase;
};

// Get moon phase name
export const getMoonPhaseName = (phase) => {
  if (phase < 0.0625 || phase >= 0.9375) return 'new';
  if (phase < 0.1875) return 'waxingCrescent';
  if (phase < 0.3125) return 'firstQuarter';
  if (phase < 0.4375) return 'waxingGibbous';
  if (phase < 0.5625) return 'full';
  if (phase < 0.6875) return 'waningGibbous';
  if (phase < 0.8125) return 'lastQuarter';
  return 'waningCrescent';
};

// Get human-readable moon phase name
export const getMoonPhaseDisplayName = (phaseName) => {
  const names = {
    new: 'New Moon',
    waxingCrescent: 'Waxing Crescent',
    firstQuarter: 'First Quarter',
    waxingGibbous: 'Waxing Gibbous',
    full: 'Full Moon',
    waningGibbous: 'Waning Gibbous',
    lastQuarter: 'Last Quarter',
    waningCrescent: 'Waning Crescent'
  };
  return names[phaseName] || 'Unknown';
};

// Calculate moon illumination percentage
export const getMoonIllumination = (phase) => {
  // Illumination is highest at full moon (phase = 0.5)
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  return Math.round(illumination * 100);
};

// Score moon phase for fishing (0-100)
export const scoreMoonPhase = (date = new Date(), species = null) => {
  const phase = getMoonPhase(date);
  const phaseName = getMoonPhaseName(phase);
  
  // Default scoring
  const defaultScores = {
    new: 85,
    waxingCrescent: 75,
    firstQuarter: 70,
    waxingGibbous: 75,
    full: 90,
    waningGibbous: 75,
    lastQuarter: 70,
    waningCrescent: 75
  };
  
  // Use species-specific scoring if available
  if (species && species.preferences && species.preferences.moonPhase) {
    return species.preferences.moonPhase[phaseName] || defaultScores[phaseName];
  }
  
  return defaultScores[phaseName] || 70;
};

// Calculate next major moon phase
export const getNextMajorPhase = (date = new Date()) => {
  const phase = getMoonPhase(date);
  const lunarMonth = 29.53058867;
  
  let nextPhaseType;
  let daysUntil;
  
  if (phase < 0.25) {
    nextPhaseType = 'First Quarter';
    daysUntil = (0.25 - phase) * lunarMonth;
  } else if (phase < 0.5) {
    nextPhaseType = 'Full Moon';
    daysUntil = (0.5 - phase) * lunarMonth;
  } else if (phase < 0.75) {
    nextPhaseType = 'Last Quarter';
    daysUntil = (0.75 - phase) * lunarMonth;
  } else {
    nextPhaseType = 'New Moon';
    daysUntil = (1 - phase) * lunarMonth;
  }
  
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + daysUntil);
  
  return {
    type: nextPhaseType,
    date: nextDate,
    daysUntil: Math.round(daysUntil * 10) / 10
  };
};

// Get moon rise and set times (simplified calculation)
export const getMoonTimes = (date = new Date(), lat, lng) => {
  const phase = getMoonPhase(date);
  
  // Simplified calculation - moon roughly rises 50 minutes later each day
  const dayOfMonth = date.getDate();
  const baseRise = 6 + (dayOfMonth * 50 / 60) % 24;
  const baseSet = (baseRise + 12) % 24;
  
  const riseTime = new Date(date);
  riseTime.setHours(Math.floor(baseRise), (baseRise % 1) * 60);
  
  const setTime = new Date(date);
  setTime.setHours(Math.floor(baseSet), (baseSet % 1) * 60);
  
  return {
    rise: riseTime,
    set: setTime
  };
};

// Check if it's a major moon phase (new or full) +/- 2 days
export const isMajorMoonPhase = (date = new Date()) => {
  const phase = getMoonPhase(date);
  // Within 0.1 of new or full moon (roughly 3 days)
  return (phase < 0.1 || phase > 0.9 || (phase > 0.4 && phase < 0.6));
};

// Get moon phase emoji
export const getMoonPhaseEmoji = (phaseName) => {
  const emojis = {
    new: '🌑',
    waxingCrescent: '🌒',
    firstQuarter: '🌓',
    waxingGibbous: '🌔',
    full: '🌕',
    waningGibbous: '🌖',
    lastQuarter: '🌗',
    waningCrescent: '🌘'
  };
  return emojis[phaseName] || '🌙';
};

// Get comprehensive moon data
export const getMoonData = (date = new Date(), lat = null, lng = null) => {
  const phase = getMoonPhase(date);
  const phaseName = getMoonPhaseName(phase);
  
  return {
    phase: phase,
    phaseName: phaseName,
    displayName: getMoonPhaseDisplayName(phaseName),
    illumination: getMoonIllumination(phase),
    emoji: getMoonPhaseEmoji(phaseName),
    isMajor: isMajorMoonPhase(date),
    nextMajorPhase: getNextMajorPhase(date),
    ...(lat && lng ? { times: getMoonTimes(date, lat, lng) } : {})
  };
};

export default {
  getMoonPhase,
  getMoonPhaseName,
  getMoonPhaseDisplayName,
  getMoonIllumination,
  scoreMoonPhase,
  getNextMajorPhase,
  getMoonTimes,
  isMajorMoonPhase,
  getMoonPhaseEmoji,
  getMoonData
};







