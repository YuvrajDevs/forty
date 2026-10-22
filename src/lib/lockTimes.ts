// When each daily lock begins. One time per reading: the first lock covers reading 1, and so on.
// Times are minutes after midnight, always in ascending order. Pure, so it can be unit tested.

export const MIN_GAP = 30;
export const MAX_LOCKS = 6;
const DAY = 24 * 60;

/** Evenly spread times from early morning to evening, on the half hour. */
export function defaultTimes(n: number): number[] {
  const count = Math.min(Math.max(Math.round(n), 1), MAX_LOCKS);
  if (count === 1) return [8 * 60];
  const first = 7 * 60;
  const last = 20 * 60;
  return Array.from({ length: count }, (_, i) => Math.round((first + ((last - first) * i) / (count - 1)) / 30) * 30);
}

const clamp = (m: number) => Math.min(Math.max(Math.round(m / 30) * 30, 0), DAY - MIN_GAP);

/** The lock times for `n` readings: the person's own choice where they made one, defaults elsewhere. */
export function timesFor(stored: number[] | undefined, n: number): number[] {
  const base = defaultTimes(n);
  const out: number[] = [];
  for (let i = 0; i < base.length; i++) {
    const v = stored?.[i];
    const m = typeof v === 'number' && Number.isFinite(v) ? clamp(v) : base[i];
    // Keep each lock after the one before it.
    out.push(i > 0 && m < out[i - 1] + MIN_GAP ? Math.min(out[i - 1] + MIN_GAP, DAY - MIN_GAP) : m);
  }
  return out;
}

/** Moves lock `index` to `minutes`, kept between its neighbours. Returns the full list to store. */
export function withTime(stored: number[] | undefined, n: number, index: number, minutes: number): number[] {
  const times = timesFor(stored, n);
  if (index < 0 || index >= times.length) return times;
  const lo = index > 0 ? times[index - 1] + MIN_GAP : 0;
  const hi = index < times.length - 1 ? times[index + 1] - MIN_GAP : DAY - MIN_GAP;
  times[index] = Math.min(Math.max(clamp(minutes), lo), Math.max(lo, hi));
  return times;
}

/** "7:30 AM" */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/**
 * Whether the next reading is due. `done` is how many readings are finished today; once all are
 * done nothing is due. Before any reading is done, the first lock time applies.
 */
export function isDue(times: number[], done: number, total: number, nowMinutes: number): boolean {
  if (total > 0 && done >= total) return false;
  if (times.length === 0) return true;
  return nowMinutes >= times[Math.min(done, times.length - 1)];
}

/**
 * Epoch ms until which apps stay open after a reading is finished: until the next lock time, or the
 * end of the day when all are done. If that time has already passed, an hour of grace.
 */
export function unlockUntil(times: number[], done: number, total: number, now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  if (total > 0 && done >= total) return midnight;
  const next = times[Math.min(done, times.length - 1)];
  if (next === undefined) return now.getTime() + 3_600_000;
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, next).getTime();
  return at > now.getTime() ? at : Math.min(now.getTime() + 3_600_000, midnight);
}
