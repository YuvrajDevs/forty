import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VOTD, usableFor, verseOfDay } from './votd.ts';

const verse = (t: string, b: string, c: number, v: number): string => {
  const book = JSON.parse(readFileSync(new URL(`../data/${t}/${b}.json`, import.meta.url), 'utf8'));
  return (book[c - 1]?.[v - 1] ?? '').trim();
};

test('every verse of the day exists in every translation it is offered in', () => {
  for (const ref of VOTD) {
    for (const t of ['web', 'kjv', 'drc'] as const) {
      if (!usableFor(ref, t)) continue;
      assert.ok(verse(t, ref[0], ref[1], ref[2]), `${t} ${ref.join(':')} is empty`);
    }
  }
});

test('no duplicates and enough variety for a year of mornings', () => {
  assert.equal(new Set(VOTD.map((r) => r.join(':'))).size, VOTD.length);
  assert.ok(VOTD.length >= 100);
});

test('the same day always gives the same verse, and it changes day to day', () => {
  assert.deepEqual(verseOfDay('2026-10-22', 'web'), verseOfDay('2026-10-22', 'web'));
  assert.notDeepEqual(verseOfDay('2026-10-22', 'web'), verseOfDay('2026-10-23', 'web'));
});

test('the Douay-Rheims never gets a Psalm', () => {
  for (let i = 0; i < 400; i++) {
    const d = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
    assert.notEqual(verseOfDay(d, 'drc')[0], 'psalms');
  }
});
