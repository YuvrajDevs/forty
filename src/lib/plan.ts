// Pacing engine. Pure functions, no I/O, so it can be unit tested with `npm test`.

export type Chapter = { bookId: string; bookName: string; chapter: number; words: number };
export type Reading = { label: string; chapters: Chapter[]; words: number; minutes: number };
export type DayPlan = { day: number; readings: Reading[] };

export const WORDS_PER_MINUTE = 240;
export const SESSION_MINUTES = 5;
export const SESSION_WORDS = WORDS_PER_MINUTE * SESSION_MINUTES;
export const MAX_LOCKS_PER_DAY = 6;

export type Summary = {
  totalWords: number;
  totalMinutes: number;
  wordsPerDay: number;
  /** Locks the goal asks for, before the cap. */
  locksNeeded: number;
  /** Locks actually scheduled per day (capped). */
  locksPerDay: number;
  capped: boolean;
  /** Shortest deadline that fits under the cap. */
  minDays: number;
};

export function summarize(chapters: Chapter[], days: number): Summary {
  const totalWords = chapters.reduce((sum, c) => sum + c.words, 0);
  const d = Math.max(1, Math.floor(days));
  const wordsPerDay = totalWords / d;
  const locksNeeded = Math.max(1, Math.ceil(wordsPerDay / SESSION_WORDS));
  return {
    totalWords,
    totalMinutes: Math.round(totalWords / WORDS_PER_MINUTE),
    wordsPerDay,
    locksNeeded,
    locksPerDay: Math.min(locksNeeded, MAX_LOCKS_PER_DAY),
    capped: locksNeeded > MAX_LOCKS_PER_DAY,
    minDays: Math.max(1, Math.ceil(totalWords / (MAX_LOCKS_PER_DAY * SESSION_WORDS))),
  };
}

export function labelFor(chapters: Chapter[]): string {
  const parts: string[] = [];
  let i = 0;
  while (i < chapters.length) {
    let j = i;
    while (
      j + 1 < chapters.length &&
      chapters[j + 1].bookId === chapters[i].bookId &&
      chapters[j + 1].chapter === chapters[j].chapter + 1
    ) {
      j++;
    }
    const a = chapters[i];
    parts.push(j === i ? `${a.bookName} ${a.chapter}` : `${a.bookName} ${a.chapter}–${chapters[j].chapter}`);
    i = j + 1;
  }
  return parts.join(', ');
}

export function makeReading(chapters: Chapter[]): Reading {
  const words = chapters.reduce((sum, c) => sum + c.words, 0);
  return { label: labelFor(chapters), chapters, words, minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)) };
}

/** Splits a day's chapters into `parts` contiguous readings of similar length. */
function splitDay(chapters: Chapter[], parts: number): Chapter[][] {
  const n = Math.min(parts, chapters.length);
  if (n <= 1) return [chapters];
  const total = chapters.reduce((sum, c) => sum + c.words, 0);
  const out: Chapter[][] = [];
  let cur: Chapter[] = [];
  let acc = 0;
  for (let i = 0; i < chapters.length; i++) {
    cur.push(chapters[i]);
    acc += chapters[i].words;
    const remainingChapters = chapters.length - i - 1;
    const remainingParts = n - out.length - 1;
    if (remainingParts > 0 && (acc >= (total * (out.length + 1)) / n || remainingChapters === remainingParts)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

/**
 * Lays chapters over `days` days. Whole chapters only; each day's chapters are cut at the
 * word count that keeps the running total closest to an even pace. Locks per day follow the
 * day's own load, capped at MAX_LOCKS_PER_DAY.
 */
export function buildPlan(chapters: Chapter[], days: number): DayPlan[] {
  const d = Math.max(1, Math.floor(days));
  const total = chapters.reduce((sum, c) => sum + c.words, 0);
  const plan: DayPlan[] = [];
  let idx = 0;
  let consumed = 0;
  for (let day = 0; day < d; day++) {
    const target = (total * (day + 1)) / d;
    const dayChapters: Chapter[] = [];
    while (idx < chapters.length) {
      const next = chapters[idx];
      const overshoot = consumed + next.words - target;
      // Take the chapter if we are short of the target, or if taking it lands closer than skipping.
      if (consumed < target && (overshoot <= 0 || overshoot < target - consumed || dayChapters.length === 0)) {
        dayChapters.push(next);
        consumed += next.words;
        idx++;
      } else break;
    }
    if (day === d - 1) while (idx < chapters.length) dayChapters.push(chapters[idx++]);
    if (!dayChapters.length) {
      plan.push({ day: day + 1, readings: [] });
      continue;
    }
    const words = dayChapters.reduce((sum, c) => sum + c.words, 0);
    const locks = Math.min(MAX_LOCKS_PER_DAY, Math.max(1, Math.ceil(words / SESSION_WORDS)));
    plan.push({ day: day + 1, readings: splitDay(dayChapters, locks).map(makeReading) });
  }
  return plan;
}

/** Recomputes from what is left, used when the user falls behind or extends the deadline. */
export function replan(chapters: Chapter[], completedChapters: number, daysLeft: number): DayPlan[] {
  return buildPlan(chapters.slice(completedChapters), Math.max(1, daysLeft));
}

export function finishDate(start: Date, days: number): Date {
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  d.setDate(d.getDate() + Math.max(1, Math.floor(days)) - 1);
  return d;
}
