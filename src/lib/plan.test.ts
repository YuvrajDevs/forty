import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPlan, summarize, finishDate, replan, MAX_LOCKS_PER_DAY } from './plan.ts';
import type { Chapter } from './plan.ts';

const src = readFileSync(new URL('../data/books.ts', import.meta.url), 'utf8');
const BOOKS: { id: string; name: string; testament: string; words: number[] }[] = JSON.parse(
  src.slice(src.indexOf('= [') + 2, src.lastIndexOf(';')),
);
const pick = (f: (b: (typeof BOOKS)[number]) => boolean): Chapter[] =>
  BOOKS.filter(f).flatMap((b) => b.words.map((words, i) => ({ bookId: b.id, bookName: b.name, chapter: i + 1, words })));

const gospels = pick((b) => ['matthew', 'mark', 'luke', 'john'].includes(b.id));
const nt = pick((b) => b.testament === 'nt');
const bible = pick(() => true);

test('data has the expected chapter counts', () => {
  assert.equal(gospels.length, 89);
  assert.equal(nt.length, 260);
  assert.equal(bible.length, 1189);
});

test('locks per day match the PRD examples', () => {
  // Real WEB word counts: Gospels are ~80k words (~5.6 h), a little more than the PRD's rough 4 h.
  assert.equal(summarize(gospels, 90).locksPerDay, 1);
  assert.equal(summarize(gospels, 60).locksPerDay, 2);
  assert.equal(summarize(gospels, 30).locksPerDay, 3);
  assert.equal(summarize(nt, 90).locksPerDay, 2);
  assert.equal(summarize(bible, 365).locksPerDay, 2);
  const fast = summarize(bible, 90);
  assert.equal(fast.locksPerDay, MAX_LOCKS_PER_DAY);
  assert.ok(fast.capped);
  assert.ok(fast.minDays > 90);
});

test('plan covers every chapter exactly once, in order', () => {
  for (const [ch, days] of [[gospels, 30], [nt, 90], [bible, 365], [gospels, 7]] as const) {
    const plan = buildPlan(ch, days);
    assert.equal(plan.length, days);
    const flat = plan.flatMap((d) => d.readings.flatMap((r) => r.chapters));
    assert.equal(flat.length, ch.length);
    flat.forEach((c, i) => assert.equal(c, ch[i]));
    assert.ok(plan.every((d) => d.readings.length <= MAX_LOCKS_PER_DAY));
  }
});

test('labels read naturally', () => {
  const plan = buildPlan(gospels, 60);
  assert.match(plan[0].readings[0].label, /^Matthew 1/);
});

test('replan spreads what is left', () => {
  const plan = replan(gospels, 40, 10);
  assert.equal(plan.length, 10);
  assert.equal(plan.flatMap((d) => d.readings.flatMap((r) => r.chapters)).length, 49);
});

test('finish date counts the start day as day one', () => {
  const end = finishDate(new Date(2026, 10, 1), 30);
  assert.equal(end.getMonth(), 10);
  assert.equal(end.getDate(), 30);
});
