// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Request permission and get push token
  async registerForPushNotifications(userId: string) {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);

      // Save token to user profile (you'll need to create this column)
      // await supabase
      //   .from('profiles')
      //   .update({ push_token: token })
      //   .eq('id', userId);

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  },

  // Send notification when new message arrives
  async sendMessageNotification(receiverId: string, senderName: string, messageContent: string) {
    try {
      // In production, you'd call your backend API to send push notification
      // For now, this is a placeholder
      console.log('Would send notification to:', receiverId);
      console.log('From:', senderName);
      console.log('Message:', messageContent);

      // Example backend call:
      // await fetch('https://your-backend.com/send-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: receiverPushToken,
      //     title: senderName,
      //     body: messageContent,
      //   }),
      // });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  // Schedule local notification (for testing)
  async scheduleLocalNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  },

  // Add notification listener
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};