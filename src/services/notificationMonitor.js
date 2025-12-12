// Notification Monitor Service
// Monitors conditions and sends alerts for bite times and excellent fishing conditions

import { getSolunarData, getTimeUntilNextPeriod } from './solunarService';
import { 
  canSendNotifications, 
  sendNotification,
  isWithinTimeWindow 
} from '../utils/notifications';
import { loadNotificationSettings, loadFavoriteLocations } from '../utils/localStorage';

let monitoringInterval = null;
let lastBiteTimeAlert = null;
let lastConditionAlerts = {};

// Start monitoring for notification triggers
export const startNotificationMonitoring = (locations, getLocationScore) => {
  if (monitoringInterval) {
    stopNotificationMonitoring();
  }
  
  // Check every 5 minutes
  monitoringInterval = setInterval(() => {
    checkNotificationTriggers(locations, getLocationScore);
  }, 5 * 60 * 1000);
  
  // Run immediately
  checkNotificationTriggers(locations, getLocationScore);
};

// Stop monitoring
export const stopNotificationMonitoring = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
};

// Check all notification triggers
const checkNotificationTriggers = async (locations, getLocationScore) => {
  const settings = loadNotificationSettings();
  
  if (!settings.enabled || !canSendNotifications()) {
    return;
  }
  
  // Check if within time window
  if (!isWithinTimeWindow(settings.timeWindow.start, settings.timeWindow.end)) {
    return;
  }
  
  // Check bite time alerts
  if (settings.biteTimeAlerts) {
    checkBiteTimeAlerts(locations);
  }
  
  // Check excellent conditions alerts
  if (settings.excellentConditionsAlert && getLocationScore) {
    checkExcellentConditionsAlerts(locations, getLocationScore, settings.threshold);
  }
};

// Check for upcoming bite times and send alerts
const checkBiteTimeAlerts = (locations) => {
  if (!locations || locations.length === 0) return;
  
  const favorites = loadFavoriteLocations();
  const targetLocation = favorites.length > 0 
    ? locations.find(l => l.id === favorites[0]) 
    : locations[0];
  
  if (!targetLocation) return;
  
  const nextPeriod = getTimeUntilNextPeriod(new Date(), targetLocation.lat, targetLocation.lng);
  
  if (!nextPeriod) return;
  
  // Alert 15 minutes before major periods
  const alertThreshold = nextPeriod.period.type === 'major' ? 15 : 10;
  const totalMinutes = nextPeriod.hours * 60 + nextPeriod.minutes;
  
  // Create a unique key for this alert
  const alertKey = `${nextPeriod.period.name}-${nextPeriod.period.start.getTime()}`;
  
  // Only alert if within threshold and haven't alerted for this period yet
  if (totalMinutes <= alertThreshold && totalMinutes > 0 && lastBiteTimeAlert !== alertKey) {
    const title = `🎣 ${nextPeriod.period.name} Starting Soon!`;
    const body = `${nextPeriod.period.type === 'major' ? 'Major' : 'Minor'} feeding period at ${targetLocation.name} in ${nextPeriod.text}. Great time to fish!`;
    
    sendNotification(title, {
      body,
      icon: '/fish-icon.png',
      tag: 'bite-time-alert',
      data: {
        type: 'bite-time',
        locationId: targetLocation.id,
        periodName: nextPeriod.period.name
      }
    });
    
    lastBiteTimeAlert = alertKey;
  }
};

// Check for excellent conditions and send alerts
const checkExcellentConditionsAlerts = async (locations, getLocationScore, threshold = 85) => {
  const favorites = loadFavoriteLocations();
  const locationsToCheck = favorites.length > 0 
    ? locations.filter(l => favorites.includes(l.id))
    : locations.slice(0, 3); // Check top 3 if no favorites
  
  for (const location of locationsToCheck) {
    try {
      const score = await getLocationScore(location);
      
      if (!score || score.overall < threshold) continue;
      
      // Create a unique key for this alert (once per hour per location)
      const alertKey = `${location.id}-${new Date().getHours()}`;
      
      if (lastConditionAlerts[location.id] === alertKey) continue;
      
      const title = `⭐ Excellent Fishing at ${location.name}!`;
      const body = `Conditions are ${score.rating} with a score of ${score.overall}. ${getConditionHighlight(score)}`;
      
      sendNotification(title, {
        body,
        icon: '/fish-icon.png',
        tag: `excellent-conditions-${location.id}`,
        data: {
          type: 'excellent-conditions',
          locationId: location.id,
          score: score.overall
        }
      });
      
      lastConditionAlerts[location.id] = alertKey;
      
    } catch (error) {
      console.error(`Error checking conditions for ${location.name}:`, error);
    }
  }
};

// Get a highlight from the score factors
const getConditionHighlight = (score) => {
  if (!score.factors) return 'Great time to fish!';
  
  const highlights = [];
  
  if (score.factors.tide >= 85) highlights.push('great tide');
  if (score.factors.wind >= 80) highlights.push('ideal wind');
  if (score.factors.timeOfDay >= 90) highlights.push('prime time');
  if (score.factors.moon >= 85) highlights.push('strong moon');
  
  if (highlights.length === 0) return 'Great time to fish!';
  
  return `${highlights.slice(0, 2).join(' and ')} conditions!`;
};

// Send a bite time reminder notification
export const sendBiteTimeReminder = (period, location) => {
  if (!canSendNotifications()) return;
  
  const title = `🎣 ${period.name} Starting Now!`;
  const body = `${period.type === 'major' ? 'Major' : 'Minor'} feeding period active at ${location?.name || 'your location'}. Fish are likely feeding!`;
  
  sendNotification(title, {
    body,
    icon: '/fish-icon.png',
    tag: 'bite-time-now',
    requireInteraction: true
  });
};

// Send an excellent conditions notification
export const sendExcellentConditionsAlert = (location, score) => {
  if (!canSendNotifications()) return;
  
  const title = `⭐ Excellent Fishing at ${location.name}!`;
  const body = `Score: ${score.overall}/100 (${score.rating}). ${getConditionHighlight(score)}`;
  
  sendNotification(title, {
    body,
    icon: '/fish-icon.png',
    tag: `excellent-${location.id}`,
    requireInteraction: true
  });
};

export default {
  startNotificationMonitoring,
  stopNotificationMonitoring,
  sendBiteTimeReminder,
  sendExcellentConditionsAlert
};






