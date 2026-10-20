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
