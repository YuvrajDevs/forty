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
};

let state: OnboardingState = {
  why: null,
  denomination: null,
  gender: null,
  phoneHours: 4,
  frequency: null,
  scope: 'gospels',
  days: 30,
};
const listeners = new Set<() => void>();

export function setOnboarding(patch: Partial<OnboardingState>) {
  state = { ...state, ...patch };
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
