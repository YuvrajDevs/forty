// The weekly reflection, built only from the person's own check-ins on their phone.
import { CONNECTION } from './checkin.ts';

export type CheckinLike = { date: string; connection: number; feelings: string[] };
export type Reflection = { headline: string; detail: string };

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const parse = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const list = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/**
 * Looks at the 7 days up to and including `today`. Needs at least two check-ins, so a single
 * entry never gets turned into a "pattern".
 */
export function weeklyReflection(checkins: CheckinLike[], today: string): Reflection | null {
  const end = parse(today);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
  const week = checkins.filter((c) => {
    const d = parse(c.date);
    return d >= start && d <= end;
  });
  if (week.length < 2) return null;

  const best = Math.max(...week.map((c) => c.connection));
  const days = week
    .filter((c) => c.connection === best)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((c) => DAY_NAMES[parse(c.date).getDay()]);

  const headline =
    best >= 3
      ? `You felt closest to God on ${list(days)}.`
      : 'This week felt quiet. Showing up still counts.';

  const counts = new Map<string, number>();
  week.forEach((c) => c.feelings.forEach((f) => counts.set(f, (counts.get(f) ?? 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
  const parts = [`${week.length} check-ins this week`];
  if (top) parts.push(`most often ${top[0].toLowerCase()}`);
  if (best >= 3) parts.push(`at your best you felt ${CONNECTION[best - 1].toLowerCase()}`);
  return { headline, detail: parts.join(', ').replace(/^./, (m) => m.toUpperCase()) + '.' };
}
