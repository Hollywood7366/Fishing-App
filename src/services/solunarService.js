// Solunar Service - Calculates optimal fishing times based on sun/moon positions
// Major periods: moonrise/moonset (2 hours each)
// Minor periods: moon overhead/underfoot (1 hour each)

// Calculate sunrise and sunset for a given date and location
export const getSunTimes = (date = new Date(), lat, lng) => {
  const dayOfYear = getDayOfYear(date);
  
  // Calculate solar declination
  const declination = 23.45 * Math.sin((360/365) * (dayOfYear - 81) * Math.PI / 180);
  
  // Calculate hour angle
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  
  // Sunrise/sunset hour angle
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad)) * 180 / Math.PI;
  
  // Solar noon (approximate based on longitude)
  const timezoneOffset = -date.getTimezoneOffset() / 60;
  const solarNoon = 12 - (lng / 15) + timezoneOffset;
  
  // Calculate times
  const sunriseHour = solarNoon - (hourAngle / 15);
  const sunsetHour = solarNoon + (hourAngle / 15);
  
  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHour), (sunriseHour % 1) * 60, 0, 0);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHour), (sunsetHour % 1) * 60, 0, 0);
  
  // Dawn is ~30 min before sunrise, dusk is ~30 min after sunset
  const dawn = new Date(sunrise.getTime() - 30 * 60 * 1000);
  const dusk = new Date(sunset.getTime() + 30 * 60 * 1000);
  
  return {
    dawn,
    sunrise,
    solarNoon: new Date(date.setHours(Math.floor(solarNoon), (solarNoon % 1) * 60, 0, 0)),
    sunset,
    dusk,
    dayLength: (sunsetHour - sunriseHour) * 60 // in minutes
  };
};

// Calculate moonrise and moonset (simplified algorithm)
export const getMoonTimes = (date = new Date(), lat, lng) => {
  // Moon rises ~50 minutes later each day
  const dayOfMonth = date.getDate();
  const monthOffset = date.getMonth() * 30;
  
  // Base moonrise time varies with moon phase
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarMonth = 29.53058867;
  const daysSinceKnownNew = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (daysSinceKnownNew % lunarMonth) / lunarMonth;
  
  // At new moon, moon rises/sets with sun
  // At full moon, moon rises at sunset
  const phaseOffset = phase * 24; // hours offset from sunrise
  
  // Calculate approximate moonrise
  const sunTimes = getSunTimes(date, lat, lng);
  const baseTime = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
  
  let moonriseHour = (baseTime + phaseOffset + (dayOfMonth * 50 / 60)) % 24;
  let moonsetHour = (moonriseHour + 12.4) % 24; // Moon is up ~12.4 hours
  
  const moonrise = new Date(date);
  moonrise.setHours(Math.floor(moonriseHour), (moonriseHour % 1) * 60, 0, 0);
  
  const moonset = new Date(date);
  moonset.setHours(Math.floor(moonsetHour), (moonsetHour % 1) * 60, 0, 0);
  
  // Moon overhead/underfoot times (when moon is at zenith/nadir)
  const moonOverheadHour = (moonriseHour + 6.2) % 24;
  const moonUnderfootHour = (moonOverheadHour + 12) % 24;
  
  const moonOverhead = new Date(date);
  moonOverhead.setHours(Math.floor(moonOverheadHour), (moonOverheadHour % 1) * 60, 0, 0);
  
  const moonUnderfoot = new Date(date);
  moonUnderfoot.setHours(Math.floor(moonUnderfootHour), (moonUnderfootHour % 1) * 60, 0, 0);
  
  return {
    moonrise,
    moonset,
    moonOverhead,
    moonUnderfoot
  };
};

// Get day of year (1-365)
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Calculate solunar feeding periods
export const getSolunarPeriods = (date = new Date(), lat, lng) => {
  const moonTimes = getMoonTimes(date, lat, lng);
  const sunTimes = getSunTimes(date, lat, lng);
  
  // Major periods: moonrise and moonset (2 hours each, centered on event)
  // Minor periods: moon overhead and underfoot (1 hour each, centered on event)
  
  const majorDuration = 2 * 60 * 60 * 1000; // 2 hours in ms
  const minorDuration = 1 * 60 * 60 * 1000; // 1 hour in ms
  
  const periods = [];
  
  // Major period: Moonrise
  periods.push({
    type: 'major',
    name: 'Moonrise',
    icon: '🌙',
    start: new Date(moonTimes.moonrise.getTime() - majorDuration / 2),
    end: new Date(moonTimes.moonrise.getTime() + majorDuration / 2),
    peak: moonTimes.moonrise,
    rating: 95
  });
  
  // Major period: Moonset
  periods.push({
    type: 'major',
    name: 'Moonset',
    icon: '🌙',
    start: new Date(moonTimes.moonset.getTime() - majorDuration / 2),
    end: new Date(moonTimes.moonset.getTime() + majorDuration / 2),
    peak: moonTimes.moonset,
    rating: 95
  });
  
  // Minor period: Moon Overhead
  periods.push({
    type: 'minor',
    name: 'Moon Overhead',
    icon: '🔝',
    start: new Date(moonTimes.moonOverhead.getTime() - minorDuration / 2),
    end: new Date(moonTimes.moonOverhead.getTime() + minorDuration / 2),
    peak: moonTimes.moonOverhead,
    rating: 80
  });
  
  // Minor period: Moon Underfoot
  periods.push({
    type: 'minor',
    name: 'Moon Underfoot',
    icon: '🔻',
    start: new Date(moonTimes.moonUnderfoot.getTime() - minorDuration / 2),
    end: new Date(moonTimes.moonUnderfoot.getTime() + minorDuration / 2),
    peak: moonTimes.moonUnderfoot,
    rating: 80
  });
  
  // Bonus: Dawn and Dusk are always good (independent of solunar)
  periods.push({
    type: 'golden',
    name: 'Dawn',
    icon: '🌅',
    start: sunTimes.dawn,
    end: sunTimes.sunrise,
    peak: new Date((sunTimes.dawn.getTime() + sunTimes.sunrise.getTime()) / 2),
    rating: 90
  });
  
  periods.push({
    type: 'golden',
    name: 'Dusk',
    icon: '🌇',
    start: sunTimes.sunset,
    end: sunTimes.dusk,
    peak: new Date((sunTimes.sunset.getTime() + sunTimes.dusk.getTime()) / 2),
    rating: 90
  });
  
  // Sort by start time
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  return periods;
};

// Get today's best fishing windows
export const getBestFishingWindows = (date = new Date(), lat, lng) => {
  const periods = getSolunarPeriods(date, lat, lng);
  const sunTimes = getSunTimes(date, lat, lng);
  
  // Combine overlapping or adjacent periods for enhanced windows
  const windows = [];
  
  // Check each period
  periods.forEach(period => {
    // Skip if period is in the past (more than 1 hour ago)
    if (period.end.getTime() < Date.now() - 60 * 60 * 1000) {
      return;
    }
    
    // Check if this period overlaps with dawn/dusk for a super period
    const isDawnDuskOverlap = periods.some(other => {
      if (other === period) return false;
      if (other.type !== 'golden' && period.type !== 'golden') return false;
      if (other.type === 'golden' && period.type === 'golden') return false;
      
      // Check overlap
      return period.start <= other.end && period.end >= other.start;
    });
    
    let enhancedRating = period.rating;
    let label = period.name;
    
    if (isDawnDuskOverlap && period.type !== 'golden') {
      enhancedRating = Math.min(100, period.rating + 10);
      label = `${period.name} + Golden Hour`;
    }
    
    windows.push({
      ...period,
      rating: enhancedRating,
      label,
      isPast: period.end.getTime() < Date.now(),
      isActive: period.start.getTime() <= Date.now() && period.end.getTime() >= Date.now(),
      isUpcoming: period.start.getTime() > Date.now()
    });
  });
  
  // Sort by rating (best first), then by time
  windows.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
    return b.rating - a.rating;
  });
  
  return {
    windows,
    sunTimes,
    bestWindow: windows.find(w => !w.isPast) || windows[0],
    activeWindow: windows.find(w => w.isActive) || null
  };
};

// Get solunar day rating (0-100)
export const getSolunarDayRating = (date = new Date(), lat, lng) => {
  const { windows, sunTimes } = getBestFishingWindows(date, lat, lng);
  
  // Calculate day rating based on:
  // 1. Number of major/minor periods during daylight
  // 2. Overlap with dawn/dusk
  // 3. Moon phase influence
  
  let rating = 50; // Base rating
  
  // Count periods during daylight hours
  const daylightPeriods = windows.filter(w => {
    const midpoint = new Date((w.start.getTime() + w.end.getTime()) / 2);
    return midpoint >= sunTimes.sunrise && midpoint <= sunTimes.sunset;
  });
  
  // Add points for major periods during day
  daylightPeriods.forEach(p => {
    if (p.type === 'major') rating += 15;
    if (p.type === 'minor') rating += 8;
    if (p.type === 'golden') rating += 10;
  });
  
  // Check for overlap bonuses
  const hasOverlap = windows.some(w => w.label.includes('Golden Hour'));
  if (hasOverlap) rating += 10;
  
  return Math.min(100, Math.round(rating));
};

// Format time for display
export const formatSolunarTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get time until next feeding period
export const getTimeUntilNextPeriod = (date = new Date(), lat, lng) => {
  const { windows } = getBestFishingWindows(date, lat, lng);
  const upcoming = windows.find(w => w.isUpcoming);
  
  if (!upcoming) return null;
  
  const diff = upcoming.start.getTime() - Date.now();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    period: upcoming,
    hours,
    minutes,
    text: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  };
};

// Get comprehensive solunar data
export const getSolunarData = (date = new Date(), lat, lng) => {
  const sunTimes = getSunTimes(date, lat, lng);
  const moonTimes = getMoonTimes(date, lat, lng);
  const periods = getSolunarPeriods(date, lat, lng);
  const { windows, bestWindow, activeWindow } = getBestFishingWindows(date, lat, lng);
  const dayRating = getSolunarDayRating(date, lat, lng);
  const nextPeriod = getTimeUntilNextPeriod(date, lat, lng);
  
  return {
    date,
    sunTimes,
    moonTimes,
    periods,
    windows,
    bestWindow,
    activeWindow,
    nextPeriod,
    dayRating,
    summary: getDaySummary(dayRating, activeWindow, nextPeriod)
  };
};

// Get human-readable day summary
const getDaySummary = (rating, activeWindow, nextPeriod) => {
  let summary = '';
  
  if (activeWindow) {
    summary = `🎣 Active feeding period NOW! (${activeWindow.name})`;
  } else if (nextPeriod) {
    if (nextPeriod.hours === 0 && nextPeriod.minutes < 30) {
      summary = `⏰ ${nextPeriod.period.name} starting in ${nextPeriod.text}!`;
    } else {
      summary = `Next bite window: ${nextPeriod.period.name} in ${nextPeriod.text}`;
    }
  } else {
    summary = 'No more major feeding periods today';
  }
  
  // Add day rating context
  if (rating >= 80) {
    summary += ' • Excellent solunar day!';
  } else if (rating >= 65) {
    summary += ' • Good solunar conditions';
  } else if (rating >= 50) {
    summary += ' • Fair solunar conditions';
  }
  
  return summary;
};

export default {
  getSunTimes,
  getMoonTimes,
  getSolunarPeriods,
  getBestFishingWindows,
  getSolunarDayRating,
  formatSolunarTime,
  getTimeUntilNextPeriod,
  getSolunarData
};






