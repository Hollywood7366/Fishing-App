// Date and time utility functions

// Format date to readable string
export const formatDate = (date, format = 'full') => {
  const d = new Date(date);
  
  const options = {
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    short: { month: 'short', day: 'numeric' },
    time: { hour: 'numeric', minute: '2-digit', hour12: true },
    datetime: { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  };
  
  return d.toLocaleDateString('en-US', options[format] || options.full);
};

// Format time to readable string
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

// Get relative time string (e.g., "2 hours ago", "in 3 days")
export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (Math.abs(diffMins) < 1) return 'just now';
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} min` : `${Math.abs(diffMins)} min ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hr` : `${Math.abs(diffHours)} hr ago`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  }
  return formatDate(date, 'short');
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const check = new Date(date);
  return today.toDateString() === check.toDateString();
};

// Check if date is tomorrow
export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const check = new Date(date);
  return tomorrow.toDateString() === check.toDateString();
};

// Get day name
export const getDayName = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return formatDate(date, 'full').split(',')[0];
};

// Get time of day period
export const getTimeOfDayPeriod = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
};

// Get sunrise/sunset times (simplified calculation)
export const getSunTimes = (date, lat, lng) => {
  // Simplified calculation - in production, use a proper library
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const latRad = lat * Math.PI / 180;
  
  // Approximate sunrise/sunset hours
  const sunriseHour = 6 + Math.sin((dayOfYear - 80) / 365 * 2 * Math.PI) * 1.5;
  const sunsetHour = 18 + Math.sin((dayOfYear - 80) / 365 * 2 * Math.PI) * 1.5;
  
  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHour), (sunriseHour % 1) * 60);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHour), (sunsetHour % 1) * 60);
  
  return { sunrise, sunset };
};

// Check if current time is within fishing hours
export const isGoodFishingHour = (date = new Date()) => {
  const hour = date.getHours();
  // Dawn, dusk, early morning, and evening are best
  return (hour >= 5 && hour < 10) || (hour >= 16 && hour < 20);
};

// Generate array of dates for forecast
export const getDateRange = (startDate, days) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Get hourly intervals for a day
export const getHourlyIntervals = (date, interval = 1) => {
  const hours = [];
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 24; i += interval) {
    const time = new Date(baseDate);
    time.setHours(i);
    hours.push(time);
  }
  return hours;
};

// Format duration
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Get week day abbreviation
export const getWeekdayAbbr = (date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
};

// Get month abbreviation
export const getMonthAbbr = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short' });
};

export default {
  formatDate,
  formatTime,
  getRelativeTime,
  isToday,
  isTomorrow,
  getDayName,
  getTimeOfDayPeriod,
  getSunTimes,
  isGoodFishingHour,
  getDateRange,
  getHourlyIntervals,
  formatDuration,
  getWeekdayAbbr,
  getMonthAbbr
};







