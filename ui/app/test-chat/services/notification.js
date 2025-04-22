import { Platform } from 'react-native';

// Conditionally import Notifications to avoid errors on web
let Notifications;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

// Configure notifications for mobile platforms
if (Platform.OS !== 'web' && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notifications
  async initialize() {
    // Skip on web platform
    if (Platform.OS === 'web' || !Notifications) {
      console.log('Notifications not supported on this platform');
      return null;
    }
    
    try {
      // Request permission for notifications
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications!');
        return null;
      }
      
      // Get push token
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      // Set up notification listeners
      this.notificationListener = Notifications.addNotificationReceivedListener(
        notification => {
          console.log('Notification received:', notification);
        }
      );
      
      this.responseListener = Notifications.addNotificationResponseReceivedListener(
        response => {
          console.log('Notification response:', response);
          // Handle notification tap here
        }
      );
      
      return token;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }
  
  // Clean up listeners
  cleanup() {
    if (Platform.OS === 'web' || !Notifications) {
      return;
    }
    
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
  
  // Show a local notification for a new message
  async showMessageNotification(senderName, messageText, conversationId) {
    if (Platform.OS === 'web' || !Notifications) {
      // On web, we can use the browser's notification API if available
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(senderName, { body: messageText });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(senderName, { body: messageText });
            }
          });
        }
      }
      return;
    }
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: senderName,
          body: messageText,
          data: { conversationId },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
