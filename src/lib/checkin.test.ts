import { test } from 'node:test';
import assert from 'node:assert/strict';
import { looksLikeCrisis, pickVerse } from './checkin.ts';

test('the PRD pairings hold', () => {
  assert.equal(pickVerse(3, ['Anxious']).ref.label, '1 Peter 5:7');
  assert.equal(pickVerse(1, []).ref.label, 'James 4:8');
  assert.equal(pickVerse(3, ['Struggling']).ref.label, 'Matthew 11:28');
  assert.equal(pickVerse(4, ['Grateful']).ref.label, '1 Thessalonians 5:18');
});

test('hard feelings take priority over a good connection score', () => {
  assert.equal(pickVerse(5, ['Joyful', 'Lonely']).ref.label, 'Deuteronomy 31:6');
});

test('every connection score has a verse', () => {
  for (let c = 1; c <= 5; c++) assert.ok(pickVerse(c, []).ref.label);
});

test('crisis wording is noticed, ordinary notes are not', () => {
  assert.equal(looksLikeCrisis("I just want to die"), true);
  assert.equal(looksLikeCrisis('Thinking about suicide lately'), true);
  assert.equal(looksLikeCrisis('Grateful for my family today'), false);
  assert.equal(looksLikeCrisis('This deadline is killing me, but I am okay'), false);
});
