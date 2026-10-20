// Local reminders. There is one daily nudge when the lock starts, and one before the trial ends.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type { OnboardingState } from './onboarding';
import { addDays, fromIso } from './schedule';

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

async function load() {
  if (inExpoGo || Platform.OS === 'web') return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

/** Asks for permission. Returns true when reminders can be sent. */
export async function requestNotificationPermission(): Promise<boolean> {
  const N = await load();
  if (!N) return false;
  try {
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('default', { name: 'Reminders', importance: N.AndroidImportance.DEFAULT });
    }
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Rebuilds every scheduled reminder from the current settings. Safe to call often. */
export async function syncNotifications(s: OnboardingState) {
  const N = await load();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!s.remindersOn || !s.completed) return;

    // Daily: when the lock starts, on each lock day. Expo weekdays run 1 (Sunday) to 7 (Saturday).
    s.lockDays.forEach((on, i) => {
      if (!on) return;
      N.scheduleNotificationAsync({
        content: {
          title: 'Your apps are locked',
          body: 'Pray and read first, then scroll. It only takes a few minutes.',
        },
        trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: ((i + 1) % 7) + 1, hour: s.lockStartHour, minute: 0 },
      }).catch(() => {});
    });

    // Trial: two days before the 7 days end.
    if (s.trialStartedAt) {
      const when = addDays(fromIso(s.trialStartedAt), 5);
      when.setHours(10, 0, 0, 0);
      if (when.getTime() > Date.now()) {
        N.scheduleNotificationAsync({
          content: {
            title: 'Your free trial ends in 2 days',
            body: 'You will be billed only if you keep going. You can cancel any time in Google Play.',
          },
          trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: when },
        }).catch(() => {});
      }
    }
  } catch {
    // Notifications are optional; never block the app on them.
  }
}
