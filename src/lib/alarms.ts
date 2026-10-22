// Verse alarms: a time, the days it rings, and whether the verse is read aloud. The phone's alarm
// clock does the ringing (see the native module), so they work with FortyBible closed.
import { native } from './lock';
import { getOnboarding, setOnboarding } from './onboarding';
import type { OnboardingState, VerseAlarm } from './onboarding';

export const MAX_ALARMS = 5;

export function newAlarm(existing: VerseAlarm[]): VerseAlarm {
  const id = existing.reduce((m, a) => Math.max(m, a.id), 0) + 1;
  return { id, minutes: 7 * 60, days: [true, true, true, true, true, true, true], on: true, speak: true, sound: true };
}

export function addAlarm() {
  const s = getOnboarding();
  if (s.alarms.length >= MAX_ALARMS) return;
  setOnboarding({ alarms: [...s.alarms, newAlarm(s.alarms)] });
}

export function updateAlarm(id: number, patch: Partial<VerseAlarm>) {
  setOnboarding({ alarms: getOnboarding().alarms.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
}

export function removeAlarm(id: number) {
  setOnboarding({ alarms: getOnboarding().alarms.filter((a) => a.id !== id) });
}

/** Hands the alarms to the phone. Safe to call often; does nothing where there is no native module. */
export function syncAlarms(s: OnboardingState) {
  if (!native) return;
  try {
    native.setAlarms(JSON.stringify(s.completed ? s.alarms : []));
  } catch {
    // Alarms are optional; never crash the app over them.
  }
}
