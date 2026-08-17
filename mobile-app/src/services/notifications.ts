import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Study Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A47A3',
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false; // push notifications don't work on simulators/emulators without extra setup

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    const result = await Notifications.getExpoPushTokenAsync();
    return result.data;
  } catch {
    return null; // e.g. no projectId configured yet — non-fatal, local reminders still work
  }
}

const REMINDER_NOTIFICATION_ID_KEY = 'daily-study-reminder';

export async function scheduleDailyReminder(time: string) {
  await cancelDailyReminder();

  const [hour, minute] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_NOTIFICATION_ID_KEY,
    content: {
      title: '📚 Time to study!',
      body: "Keep your streak going — today's topics are ready for you.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID_KEY).catch(() => {});
}