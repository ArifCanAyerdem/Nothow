import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const setupNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleTaskNotification = async (taskId: string, title: string, scheduledAt: number) => {
  if (Platform.OS === 'web') return;
  
  const trigger = new Date(scheduledAt);
  if (trigger.getTime() <= Date.now()) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: taskId, // Use taskId as identifier to easily cancel later
      content: {
        title: "Kasa: Görev Zamanı! 🔒",
        body: title,
        data: { taskId },
      },
      trigger,
    });
  } catch (e) {
    console.error('Failed to schedule notification', e);
  }
};

export const cancelTaskNotification = async (taskId: string) => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(taskId);
  } catch (e) {
    console.error('Failed to cancel notification', e);
  }
};
