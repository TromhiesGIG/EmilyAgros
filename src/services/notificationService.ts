// src/services/notificationService.ts
// Push notifications disabled for Expo Go testing (SDK 53+)
// Re-enable when using development build for TestFlight/Play Store

export const notificationService = {
  async registerForPushNotifications(userId: string) {
    // TODO: Re-enable when using development build
    console.log('Push notifications disabled in Expo Go');
    return null;
  },

  async sendMessageNotification(receiverId: string, senderName: string, messageContent: string) {
    // TODO: Re-enable when using development build
    console.log('Would send notification to:', receiverId);
  },

  async scheduleLocalNotification(title: string, body: string) {
    // TODO: Re-enable when using development build
    console.log('Would schedule notification:', title, body);
  },

  addNotificationReceivedListener(callback: (notification: any) => void) {
    // TODO: Re-enable when using development build
    return { remove: () => {} };
  },

  addNotificationResponseListener(callback: (response: any) => void) {
    // TODO: Re-enable when using development build
    return { remove: () => {} };
  },
};