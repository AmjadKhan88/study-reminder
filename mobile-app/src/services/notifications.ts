import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Only load the native module when NOT in Expo Go. A static `import` at the
// top of this file would execute regardless of any runtime check — this
// conditional `require()` is what actually prevents expo-notifications'
// Android code from ever initializing (and crashing) inside Expo Go.
let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  Notifications = require('expo-notifications');
}

export async function setupNotificationChannel() {
  if (!Notifications || Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('study-reminders', {
      name: 'Study Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A47A3',
    });
  } catch (err) {
    console.warn('Notification channel setup skipped:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications || !Device.isDevice) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Notification permission request skipped:', err);
    return false;
  }
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Notifications || !Device.isDevice) return null;
  try {
    const result = await Notifications.getExpoPushTokenAsync();
    return result.data;
  } catch {
    return null;
  }
}

const REMINDER_NOTIFICATION_ID_KEY = 'daily-study-reminder';

export async function scheduleDailyReminder(time: string) {
  if (!Notifications) return;
  try {
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
  } catch (err) {
    console.warn('Reminder scheduling skipped:', err);
  }
}

export async function cancelDailyReminder() {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID_KEY).catch(() => {});
}