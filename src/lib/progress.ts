import { getOnboarding, setOnboarding } from './onboarding';
import type { OnboardingState } from './onboarding';
import { replan, SESSION_WORDS, summarize } from './plan';
import type { Chapter, Reading } from './plan';
import { activeDaysBetween, addActiveDays, fromIso, iso, isActive } from './schedule';
import { chaptersFor } from './scopes';

export type Today = {
  date: string;
  chapters: Chapter[];
  baseline: number;
  readings: Reading[];
  doneCount: number;
  daysLeft: number;
  active: boolean;
  finished: boolean;
};

export function getToday(s: OnboardingState, now = new Date()): Today {
  const date = iso(now);
  const chapters = chaptersFor(s.scope);
  const baseline = s.baseline?.date === date ? s.baseline.chapters : s.chaptersDone;
  const doneCount = s.doneToday?.date === date ? s.doneToday.count : 0;
  const deadline = s.deadline ? fromIso(s.deadline) : now;
  const daysLeft = Math.max(1, activeDaysBetween(now, deadline, s.lockDays));
  const active = isActive(now, s.lockDays);
  const finished = baseline >= chapters.length;
  const readings = active && !finished ? replan(chapters, baseline, daysLeft)[0]?.readings ?? [] : [];
  return { date, chapters, baseline, readings, doneCount, daysLeft, active, finished };
}

export function completeNextReading() {
  const s = getOnboarding();
  const t = getToday(s);
  if (t.doneCount >= t.readings.length) return;
  const r = t.readings[t.doneCount];
  const allDone = t.doneCount + 1 === t.readings.length;
  setOnboarding({
    baseline: { date: t.date, chapters: t.baseline },
    doneToday: { date: t.date, count: t.doneCount + 1 },
    chaptersDone: s.chaptersDone + r.chapters.length,
    doneDates: allDone && !s.doneDates.includes(t.date) ? [...s.doneDates, t.date] : s.doneDates,
  });
}

/** Words left from where today started. */
const remaining = (s: OnboardingState) => {
  const t = getToday(s);
  return t.chapters.slice(t.baseline);
};

/** Sets the finish date from a number of reading days counted from today. */
export function setReadingDays(n: number, mask = getOnboarding().lockDays) {
  setOnboarding({ lockDays: mask, deadline: iso(addActiveDays(new Date(), Math.max(1, n), mask)) });
}

/** Sets the pace as readings per day; the finish date follows. */
export function setReadingsPerDay(r: number) {
  const s = getOnboarding();
  const words = remaining(s).reduce((sum, c) => sum + c.words, 0);
  const days = Math.max(1, Math.ceil(words / (r * SESSION_WORDS)));
  setOnboarding({ deadline: iso(addActiveDays(new Date(), days, s.lockDays)) });
}

/** Changes lock days but keeps today's pace, so the finish date moves instead. */
export function setLockDays(mask: boolean[]) {
  const s = getOnboarding();
  if (!mask.some(Boolean)) return;
  const t = getToday(s);
  const locks = summarize(remaining(s), t.daysLeft).locksPerDay;
  const words = remaining(s).reduce((sum, c) => sum + c.words, 0);
  const days = Math.max(1, Math.ceil(words / (locks * SESSION_WORDS)));
  setOnboarding({ lockDays: mask, deadline: iso(addActiveDays(new Date(), days, mask)) });
}

export function currentLocksPerDay(s: OnboardingState): number {
  const t = getToday(s);
  return summarize(t.chapters.slice(t.baseline), t.daysLeft).locksPerDay;
}
