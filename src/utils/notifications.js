// Browser notification utilities

let permission = 'default';

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    permission = 'granted';
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    permission = result;
    return result === 'granted';
  }
  
  permission = 'denied';
  return false;
};

// Check if notifications are supported and permitted
export const canSendNotifications = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!canSendNotifications()) {
    console.log('Cannot send notification - permission not granted');
    return null;
  }
  
  const defaultOptions = {
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    tag: 'fishing-app',
    renotify: false,
    requireInteraction: false,
    ...options
  };
  
  try {
    const notification = new Notification(title, defaultOptions);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// Send fishing condition alert
export const sendFishingAlert = (location, score, rating) => {
  const title = `Great fishing at ${location.name}!`;
  const body = `Conditions are ${rating} with a score of ${score}. Time to fish!`;
  
  return sendNotification(title, {
    body,
    icon: '/fish-icon.png',
    tag: `fishing-alert-${location.id}`,
    data: {
      locationId: location.id,
      score,
      timestamp: Date.now()
    }
  });
};

// Send custom alert
export const sendCustomAlert = (message, options = {}) => {
  return sendNotification('Fishing App Alert', {
    body: message,
    ...options
  });
};

// Check if within notification time window
export const isWithinTimeWindow = (startHour = 6, endHour = 20) => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= startHour && hour < endHour;
};

// Schedule a notification check
let notificationInterval = null;

export const startNotificationMonitoring = (checkCallback, intervalMinutes = 60) => {
  if (notificationInterval) {
    stopNotificationMonitoring();
  }
  
  // Run immediately
  checkCallback();
  
  // Then run on interval
  notificationInterval = setInterval(checkCallback, intervalMinutes * 60 * 1000);
};

export const stopNotificationMonitoring = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
};

// Get notification permission status
export const getPermissionStatus = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

// Test notification
export const sendTestNotification = () => {
  return sendNotification('Test Notification', {
    body: 'Notifications are working! You\'ll receive alerts when fishing conditions are great.',
    icon: '/fish-icon.png'
  });
};

export default {
  requestNotificationPermission,
  canSendNotifications,
  sendNotification,
  sendFishingAlert,
  sendCustomAlert,
  isWithinTimeWindow,
  startNotificationMonitoring,
  stopNotificationMonitoring,
  getPermissionStatus,
  sendTestNotification
};







