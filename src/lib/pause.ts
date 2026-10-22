// Pausing a plan for travel or illness. Paused days never break a streak and push the finish date back.
import { addDays, fromIso, isActive, iso } from './schedule.ts';

export type PauseState = { pausedFrom?: string | null; pausedUntil?: string | null };

export const isPausedOn = (s: PauseState, date: string) =>
  !!s.pausedFrom && date >= s.pausedFrom && (!s.pausedUntil || date <= s.pausedUntil);

const range = (from: string, to: string): string[] => {
  const out: string[] = [];
  for (let d = fromIso(from); iso(d) <= to; d = addDays(d, 1)) out.push(iso(d));
  return out;
};

/** Paused dates up to and including `today` while a pause is running (used so a streak stays safe). */
export function pausedDatesSoFar(s: PauseState, today: string): string[] {
  if (!s.pausedFrom || s.pausedFrom > today) return [];
  const end = s.pausedUntil && s.pausedUntil < today ? s.pausedUntil : today;
  return range(s.pausedFrom, end);
}

/**
 * Resuming on `today`: the paused days (before today) become skipped days, and the finish date moves
 * back by the number of lock days that were paused.
 */
export function resumeEffect(s: PauseState, today: string, lockDays: boolean[]): { skipped: string[]; extraActiveDays: number } {
  if (!s.pausedFrom) return { skipped: [], extraActiveDays: 0 };
  const yesterday = iso(addDays(fromIso(today), -1));
  const end = s.pausedUntil && s.pausedUntil < yesterday ? s.pausedUntil : yesterday;
  if (end < s.pausedFrom) return { skipped: [], extraActiveDays: 0 };
  const skipped = range(s.pausedFrom, end);
  return { skipped, extraActiveDays: skipped.filter((d) => isActive(fromIso(d), lockDays)).length };
}
