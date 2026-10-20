import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeToday, key } from './today.ts';
import type { PlanState } from './today.ts';
import type { Chapter } from './plan.ts';
import { iso } from './schedule.ts';

const ALL = [true, true, true, true, true, true, true];
const mk = (n: number): Chapter[] => Array.from({ length: n }, (_, i) => ({ bookId: 'b', bookName: 'B', chapter: i + 1, words: 1000 }));
const now = new Date(2026, 10, 2); // Monday
const base = (over: Partial<PlanState> = {}): PlanState => ({
  lockDays: ALL,
  deadline: iso(new Date(2026, 10, 11)), // 10 days
  readChapters: [],
  dayPlan: null,
  ...over,
});

test('a day covers an even share of the unread chapters', () => {
  const t = computeToday(mk(20), base(), now);
  assert.equal(t.readings.flatMap((r) => r.chapters).length, 2); // 20 chapters over 10 days
  assert.equal(t.chaptersRead, 0);
  assert.equal(t.finished, false);
});

test('chapters already read are skipped and counted', () => {
  const chapters = mk(20);
  const read = ['b:1', 'b:2', 'b:3', 'b:4'];
  const t = computeToday(chapters, base({ readChapters: read }), now);
  assert.equal(t.chaptersRead, 4);
  const planned = t.readings.flatMap((r) => r.chapters.map(key));
  assert.ok(planned.every((k) => !read.includes(k)));
  assert.equal(planned[0], 'b:5');
});

test('a saved day plan stays stable as chapters get read, and reads mark readings done', () => {
  const chapters = mk(20);
  const saved = computeToday(chapters, base(), now);
  const keys = saved.readings.map((r) => r.chapters.map(key));
  const dayPlan = { date: iso(now), readings: keys };
  const afterOne = computeToday(chapters, base({ dayPlan, readChapters: keys[0] }), now);
  assert.equal(afterOne.readings.length, saved.readings.length);
  assert.equal(afterOne.doneCount, 1);
  const allKeys = keys.flat();
  const afterAll = computeToday(chapters, base({ dayPlan, readChapters: allKeys }), now);
  assert.equal(afterAll.nextIndex, -1);
  assert.equal(afterAll.doneCount, afterAll.readings.length);
});

test('a chapter read from the Read tab can complete a planned reading', () => {
  const chapters = mk(20);
  const first = computeToday(chapters, base(), now).readings[0];
  const t = computeToday(chapters, base({ dayPlan: { date: iso(now), readings: computeToday(chapters, base(), now).readings.map((r) => r.chapters.map(key)) }, readChapters: first.chapters.map(key) }), now);
  assert.equal(t.done[0], true);
});

test('rest days have no readings and finished plans say so', () => {
  const sunday = new Date(2026, 10, 8);
  const mask = [true, true, true, true, true, true, false];
  assert.equal(computeToday(mk(20), base({ lockDays: mask, deadline: iso(new Date(2026, 10, 20)) }), sunday).readings.length, 0);
  const done = mk(3).map(key);
  assert.equal(computeToday(mk(3), base({ readChapters: done }), now).finished, true);
});
