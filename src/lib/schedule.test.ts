import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeDaysBetween, addActiveDays, iso, streak } from './schedule.ts';

const ALL = [true, true, true, true, true, true, true];
const WEEKDAYS = [true, true, true, true, true, false, false];
const d = (s: string) => new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8)));

test('every day active: nth day is n-1 days later', () => {
  assert.equal(iso(addActiveDays(d('2026-11-02'), 30, ALL)), '2026-12-01');
});

test('weekdays only skips weekends', () => {
  // Mon 2 Nov + 5 active days = Fri 6 Nov; 6th is Mon 9 Nov.
  assert.equal(iso(addActiveDays(d('2026-11-02'), 5, WEEKDAYS)), '2026-11-06');
  assert.equal(iso(addActiveDays(d('2026-11-02'), 6, WEEKDAYS)), '2026-11-09');
  assert.equal(activeDaysBetween(d('2026-11-02'), d('2026-11-15'), WEEKDAYS), 10);
});

test('streak counts finished days and forgives one miss per week', () => {
  const start = d('2026-11-02');
  const today = d('2026-11-06'); // Friday
  assert.equal(streak(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'], ALL, today, start), 5);
  // Wed missed: grace forgives it.
  assert.equal(streak(['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06'], ALL, today, start), 4);
  // Two misses in one week: streak stops at the second.
  assert.equal(streak(['2026-11-02', '2026-11-05', '2026-11-06'], ALL, today, start), 2);
});

test('open today does not break the streak', () => {
  const start = d('2026-11-02');
  assert.equal(streak(['2026-11-02', '2026-11-03'], ALL, d('2026-11-04'), start), 2);
});

import { missedDays } from './schedule.ts';

test('missed days skip rest days, skipped days and read days', () => {
  const from = d('2026-11-02'); // Monday
  const today = d('2026-11-09'); // next Monday
  assert.equal(missedDays([], [], ALL, from, today), 7);
  assert.equal(missedDays(['2026-11-02', '2026-11-03'], [], ALL, from, today), 5);
  assert.equal(missedDays([], ['2026-11-04'], ALL, from, today), 6);
  assert.equal(missedDays([], [], WEEKDAYS, from, today), 5);
});

test('a skipped day does not break the streak', () => {
  const start = d('2026-11-02');
  const today = d('2026-11-05');
  assert.equal(streak(['2026-11-02', '2026-11-04', '2026-11-05'], ALL, today, start, ['2026-11-03']), 3);
});
