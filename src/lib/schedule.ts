// Date helpers for lock days, finish dates and streaks. Pure, so they can be unit tested.

export type Mask = boolean[]; // Monday first

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
};

/** 0 = Monday ... 6 = Sunday. */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const isActive = (d: Date, mask: Mask) => mask[weekdayIndex(d)];

/** The date of the nth active day counting `from` itself (n >= 1). */
export function addActiveDays(from: Date, n: number, mask: Mask): Date {
  if (!mask.some(Boolean)) return from;
  let d = from;
  let count = 0;
  for (let i = 0; i < 4000; i++) {
    if (isActive(d, mask)) {
      count++;
      if (count >= n) return d;
    }
    d = addDays(d, 1);
  }
  return d;
}

/** Active days from `from` to `to`, both included. */
export function activeDaysBetween(from: Date, to: Date, mask: Mask): number {
  let count = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (isActive(d, mask)) count++;
  return count;
}

/** Monday of the week containing d, as an ISO string. */
const weekKey = (d: Date) => iso(addDays(d, -weekdayIndex(d)));

/**
 * Consecutive finished days ending today. Rest days never break a streak, and one missed
 * lock day per week is forgiven (the "grace day"). Today does not break it while still open.
 */
export function streak(doneDates: string[], mask: Mask, today: Date, startedOn: Date, skipped: string[] = []): number {
  const done = new Set(doneDates);
  const skip = new Set(skipped);
  const graceUsed = new Set<string>();
  let count = 0;
  let d = today;
  if (isActive(d, mask) && !skip.has(iso(d)) && !done.has(iso(d))) d = addDays(d, -1);
  for (let i = 0; i < 1000 && d >= startedOn; i++, d = addDays(d, -1)) {
    if (!isActive(d, mask) || (skip.has(iso(d)) && !done.has(iso(d)))) continue;
    if (done.has(iso(d))) {
      count++;
      continue;
    }
    const wk = weekKey(d);
    if (graceUsed.has(wk)) break;
    graceUsed.add(wk);
  }
  return count;
}

/** Lock days before `today`, counted from `from`, that were neither read nor skipped. */
export function missedDays(doneDates: string[], skipped: string[], mask: Mask, from: Date, today: Date): number {
  const done = new Set(doneDates);
  const skip = new Set(skipped);
  let n = 0;
  for (let d = from; d < today; d = addDays(d, 1)) {
    const k = iso(d);
    if (isActive(d, mask) && !done.has(k) && !skip.has(k)) n++;
  }
  return n;
}
