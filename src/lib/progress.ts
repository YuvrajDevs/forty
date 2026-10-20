import { getOnboarding, setOnboarding } from './onboarding';
import type { OnboardingState } from './onboarding';
import { SESSION_WORDS, summarize } from './plan';
import { addActiveDays, iso } from './schedule';
import { chaptersFor } from './scopes';
import { computeToday, freshReadings, key } from './today';
import type { Today } from './today';

export type { Today };

export const getToday = (s: OnboardingState, now = new Date()): Today => computeToday(chaptersFor(s.scope), s, now);

/** Saves today's list the first time it is needed, so it does not shift as chapters get read. */
export function ensureDayPlan() {
  const s = getOnboarding();
  const now = new Date();
  const date = iso(now);
  if (s.dayPlan?.date === date) return;
  const readings = freshReadings(chaptersFor(s.scope), s, now);
  setOnboarding({ dayPlan: { date, readings: readings.map((r) => r.chapters.map(key)) } });
}

/** Today's list is rebuilt after a pace change, unless some of it has already been read. */
function refreshDayPlan() {
  const s = getOnboarding();
  const read = new Set(s.readChapters);
  if (s.dayPlan && !s.dayPlan.readings.flat().some((k) => read.has(k))) setOnboarding({ dayPlan: null });
}

/**
 * Marks chapters read, from the reader or from the Read tab. Any reading counts for the day's
 * streak, and a planned reading is done once all of its chapters are read.
 */
export function markChaptersRead(keys: string[]) {
  ensureDayPlan();
  const s = getOnboarding();
  const date = iso(new Date());
  setOnboarding({
    readChapters: [...new Set([...s.readChapters, ...keys])],
    doneDates: s.doneDates.includes(date) ? s.doneDates : [...s.doneDates, date],
  });
}

const unreadWords = (s: OnboardingState) => getToday(s).unreadChapters.reduce((sum, c) => sum + c.words, 0);

/** Sets the finish date from a number of reading days counted from today. */
export function setReadingDays(n: number, mask = getOnboarding().lockDays) {
  setOnboarding({ lockDays: mask, deadline: iso(addActiveDays(new Date(), Math.max(1, n), mask)) });
  refreshDayPlan();
}

/** Sets the pace as readings per day; the finish date follows. */
export function setReadingsPerDay(r: number) {
  const s = getOnboarding();
  const days = Math.max(1, Math.ceil(unreadWords(s) / (r * SESSION_WORDS)));
  setOnboarding({ deadline: iso(addActiveDays(new Date(), days, s.lockDays)) });
  refreshDayPlan();
}

/** Changes lock days but keeps today's pace, so the finish date moves instead. */
export function setLockDays(mask: boolean[]) {
  const s = getOnboarding();
  if (!mask.some(Boolean)) return;
  const locks = currentLocksPerDay(s);
  const days = Math.max(1, Math.ceil(unreadWords(s) / (locks * SESSION_WORDS)));
  setOnboarding({ lockDays: mask, deadline: iso(addActiveDays(new Date(), days, mask)) });
  refreshDayPlan();
}

export function currentLocksPerDay(s: OnboardingState): number {
  const t = getToday(s);
  return summarize(t.unreadChapters, t.daysLeft).locksPerDay;
}
