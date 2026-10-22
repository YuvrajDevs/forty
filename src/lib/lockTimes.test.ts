import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultTimes, formatTime, isDue, timesFor, unlockUntil, withTime } from './lockTimes.ts';

test('defaults are ascending, on the half hour, and one per lock', () => {
  for (let n = 1; n <= 6; n++) {
    const t = defaultTimes(n);
    assert.equal(t.length, n);
    assert.ok(t.every((m, i) => m % 30 === 0 && (i === 0 || m > t[i - 1])));
  }
  assert.deepEqual(defaultTimes(1), [480]);
  assert.deepEqual(defaultTimes(2), [420, 1200]);
});

test('defaults handle odd input', () => {
  assert.equal(defaultTimes(0).length, 1);
  assert.equal(defaultTimes(99).length, 6);
});

test('stored times win, extra slots fall back to defaults', () => {
  assert.deepEqual(timesFor([600], 2), [600, 1200]);
  assert.deepEqual(timesFor(undefined, 1), [480]);
});

test('times stay ordered even from bad stored data', () => {
  const t = timesFor([900, 600, NaN as number], 3);
  assert.ok(t[1] >= t[0] + 30 && t[2] >= t[1] + 30);
});

test('withTime keeps neighbours apart', () => {
  assert.deepEqual(withTime([420, 1200], 2, 0, 1300), [1170, 1200]);
  assert.deepEqual(withTime([420, 1200], 2, 1, 0), [420, 450]);
  assert.deepEqual(withTime([420], 1, 0, -50), [0]);
});

test('formatTime', () => {
  assert.equal(formatTime(0), '12:00 AM');
  assert.equal(formatTime(450), '7:30 AM');
  assert.equal(formatTime(720), '12:00 PM');
  assert.equal(formatTime(1170), '7:30 PM');
});

test('isDue follows the next reading', () => {
  const times = [420, 1200];
  assert.equal(isDue(times, 0, 2, 419), false);
  assert.equal(isDue(times, 0, 2, 420), true);
  assert.equal(isDue(times, 1, 2, 600), false);
  assert.equal(isDue(times, 1, 2, 1200), true);
  assert.equal(isDue(times, 2, 2, 1300), false);
});

test('unlockUntil gives the next lock time, the rest of the day, or an hour of grace', () => {
  const noon = new Date(2026, 9, 22, 12, 0);
  const t = [420, 1200];
  assert.equal(unlockUntil(t, 1, 2, noon), new Date(2026, 9, 22, 20, 0).getTime());
  assert.equal(unlockUntil(t, 2, 2, noon), new Date(2026, 9, 23).getTime());
  assert.equal(unlockUntil([420, 600], 1, 2, noon), noon.getTime() + 3_600_000);
});
