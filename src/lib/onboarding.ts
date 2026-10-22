import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { TranslationId } from './bible';
import type { MemoryCard } from './memory';
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
  translation: TranslationId;
  /** Chapters read, as "bookId:chapter". */
  readChapters: string[];
  deadline: string | null;
  /** Today's readings as "bookId:chapter" keys, fixed at the start of the day so they stay stable. */
  dayPlan: { date: string; readings: string[][] } | null;
  doneDates: string[];
  checkins: Checkin[];
  /** Verse highlights, by "bookId:chapter:verse". */
  highlights: Record<string, HighlightColor>;
  /** Saved verses, by "bookId:chapter:verse", newest last. */
  bookmarks: string[];
  memory: MemoryCard[];
  pausedFrom: string | null;
  pausedUntil: string | null;
  /** Speech rate for audio mode (1 is normal). */
  audioRate: number;
  /** Days the user chose to skip. They neither add to nor break the streak. */
  skippedDates: string[];
  /** Missed days are counted from this date; moved forward when the deadline is extended. */
  behindFrom: string | null;
  trialStartedAt: string | null;
  entitled: boolean;
  entitlementCheckedAt: number | null;
};

export type HighlightColor = 'gold' | 'green' | 'rose';

export type Checkin = {
  date: string;
  connection: number;
  feelings: string[];
  note: string;
  verse: string;
};

const KEY = 'forty.onboarding.v1';

const initial: OnboardingState = {
  why: null,
  denomination: null,
  gender: null,
  phoneHours: 4,
  frequency: null,
  scope: 'gospels',
  days: 90,
  lockedApps: [],
  remindersOn: false,
  startedOn: null,
  completed: false,
  lockDays: [true, true, true, true, true, true, true],
  lockStartHour: 7,
  lockEndHour: 22,
  gapHours: 3,
  readerFontSize: 20,
  translation: 'web',
  readChapters: [],
  deadline: null,
  dayPlan: null,
  doneDates: [],
  checkins: [],
  highlights: {},
  bookmarks: [],
  memory: [],
  pausedFrom: null,
  pausedUntil: null,
  audioRate: 1,
  skippedDates: [],
  behindFrom: null,
  trialStartedAt: null,
  entitled: false,
  entitlementCheckedAt: null,
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

/** Wipes everything stored on the phone. */
export async function deleteAllData() {
  state = { ...initial };
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
  listeners.forEach((l) => l());
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
