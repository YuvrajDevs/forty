// Pure "what is on today's list" logic. Kept free of storage imports so it can be unit tested.
import { makeReading, replan } from './plan.ts';
import type { Chapter, Reading } from './plan.ts';
import { isPausedOn } from './pause.ts';
import { activeDaysBetween, fromIso, isActive, iso } from './schedule.ts';

export type PlanState = {
  lockDays: boolean[];
  deadline: string | null;
  readChapters: string[];
  dayPlan: { date: string; readings: string[][] } | null;
  skippedDates?: string[];
  pausedFrom?: string | null;
  pausedUntil?: string | null;
};

export type Today = {
  date: string;
  readings: Reading[];
  done: boolean[];
  doneCount: number;
  /** Index of the first reading not yet finished, or -1. */
  nextIndex: number;
  daysLeft: number;
  active: boolean;
  finished: boolean;
  skipped: boolean;
  paused: boolean;
  chaptersRead: number;
  unreadChapters: Chapter[];
};

export const key = (c: { bookId: string; chapter: number }) => `${c.bookId}:${c.chapter}`;

/** Readings for today, built only from chapters not read yet. Used when a day has no saved plan. */
export function freshReadings(chapters: Chapter[], s: PlanState, now: Date): Reading[] {
  const read = new Set(s.readChapters);
  const unread = chapters.filter((c) => !read.has(key(c)));
  if (!unread.length || !isActive(now, s.lockDays) || isPausedOn(s, iso(now))) return [];
  const deadline = s.deadline ? fromIso(s.deadline) : now;
  const daysLeft = Math.max(1, activeDaysBetween(now, deadline, s.lockDays));
  return replan(unread, 0, daysLeft)[0]?.readings ?? [];
}

export function computeToday(chapters: Chapter[], s: PlanState, now = new Date()): Today {
  const date = iso(now);
  const read = new Set(s.readChapters);
  const byKey = new Map(chapters.map((c) => [key(c), c]));
  const unreadChapters = chapters.filter((c) => !read.has(key(c)));
  const deadline = s.deadline ? fromIso(s.deadline) : now;
  const daysLeft = Math.max(1, activeDaysBetween(now, deadline, s.lockDays));

  const paused = isPausedOn(s, date);
  const skipped = (s.skippedDates ?? []).includes(date);
  const active = isActive(now, s.lockDays) && !skipped && !paused;
  const readings: Reading[] = skipped || paused
    ? []
    : s.dayPlan?.date === date
      ? s.dayPlan.readings.map((keys) => makeReading(keys.map((k) => byKey.get(k)).filter((c): c is Chapter => !!c))).filter((r) => r.chapters.length)
      : freshReadings(chapters, s, now);

  const done = readings.map((r) => r.chapters.every((c) => read.has(key(c))));
  return {
    date,
    readings,
    done,
    doneCount: done.filter(Boolean).length,
    nextIndex: done.indexOf(false),
    daysLeft,
    active,
    finished: unreadChapters.length === 0,
    skipped,
    paused,
    chaptersRead: chapters.length - unreadChapters.length,
    unreadChapters,
  };
}
