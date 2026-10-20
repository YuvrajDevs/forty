import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { ScopeId } from './scopes';

export type OnboardingState = {
  why: string | null;
  denomination: string | null;
  gender: string | null;
  phoneHours: number;
  frequency: string | null;
  scope: ScopeId;
  days: number;
  lockedApps: string[];
  remindersOn: boolean;
  startedOn: string | null;
  completed: boolean;
  /** Monday first. */
  lockDays: boolean[];
  lockStartHour: number;
  lockEndHour: number;
  /** Hours between one reading prompt and the next. */
  gapHours: number;
  readerFontSize: number;
  /** Chapters read, as "bookId:chapter". */
  readChapters: string[];
  deadline: string | null;
  chaptersDone: number;
  baseline: { date: string; chapters: number } | null;
  doneToday: { date: string; count: number } | null;
  doneDates: string[];
};

const KEY = 'forty.onboarding.v1';

const initial: OnboardingState = {
  why: null,
  denomination: null,
  gender: null,
  phoneHours: 4,
  frequency: null,
  scope: 'gospels',
  days: 30,
  lockedApps: [],
  remindersOn: false,
  startedOn: null,
  completed: false,
  lockDays: [true, true, true, true, true, true, true],
  lockStartHour: 7,
  lockEndHour: 22,
  gapHours: 3,
  readerFontSize: 20,
  readChapters: [],
  deadline: null,
  chaptersDone: 0,
  baseline: null,
  doneToday: null,
  doneDates: [],
};

let state: OnboardingState = initial;
const listeners = new Set<() => void>();

export async function loadOnboarding() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    // Storage unavailable: start fresh.
  }
}

export function setOnboarding(patch: Partial<OnboardingState>) {
  state = { ...state, ...patch };
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  listeners.forEach((l) => l());
}

export function getOnboarding(): OnboardingState {
  return state;
}

export function resetOnboarding() {
  setOnboarding({ ...initial });
}

export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
