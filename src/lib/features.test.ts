import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCard, dueCards, review, removeCard } from './memory.ts';
import { weeklyReflection } from './reflection.ts';
import { buildIndex, parseReference, searchVerses } from './search.ts';

test('memory: new cards are due today, correct answers push them out, wrong ones restart', () => {
  let cards = addCard([], 'john:3:16', '2026-10-22');
  assert.equal(dueCards(cards, '2026-10-22').length, 1);
  cards = review(cards, 'john:3:16', true, '2026-10-22');
  assert.equal(cards[0].box, 1);
  assert.equal(cards[0].due, '2026-10-24'); // box 1 comes back after 2 days
  assert.equal(dueCards(cards, '2026-10-23').length, 0);
  cards = review(cards, 'john:3:16', false, '2026-10-24');
  assert.equal(cards[0].box, 0);
  assert.equal(cards[0].due, '2026-10-25');
  assert.equal(addCard(cards, 'john:3:16', '2026-10-24').length, 1); // no duplicates
  assert.equal(removeCard(cards, 'john:3:16').length, 0);
});

test('reflection: names the closest days, and stays quiet with too little data', () => {
  const week = [
    { date: '2026-10-18', connection: 5, feelings: ['Grateful'] }, // Sunday
    { date: '2026-10-19', connection: 3, feelings: ['Tired'] },
    { date: '2026-10-21', connection: 5, feelings: ['Grateful', 'Hopeful'] }, // Wednesday
  ];
  const r = weeklyReflection(week, '2026-10-22')!;
  assert.equal(r.headline, 'You felt closest to God on Sunday and Wednesday.');
  assert.match(r.detail, /3 check-ins/);
  assert.match(r.detail, /grateful/);
  assert.equal(weeklyReflection(week.slice(0, 1), '2026-10-22'), null);
  assert.equal(weeklyReflection(week, '2026-11-30'), null); // older than a week
});

test('reflection: a dry week is met gently', () => {
  const r = weeklyReflection(
    [
      { date: '2026-10-20', connection: 1, feelings: [] },
      { date: '2026-10-21', connection: 2, feelings: ['Tired'] },
    ],
    '2026-10-22',
  )!;
  assert.match(r.headline, /Showing up still counts/);
});

const books = [
  { id: 'john', name: 'John' },
  { id: '1corinthians', name: '1 Corinthians' },
  { id: 'psalms', name: 'Psalms' },
  { id: 'songofsolomon', name: 'Song of Solomon' },
];

test('search: references in the usual forms', () => {
  assert.deepEqual(parseReference('John 3:16', books), { bookId: 'john', chapter: 3, verse: 16 });
  assert.deepEqual(parseReference('jn 3', books), { bookId: 'john', chapter: 3, verse: undefined });
  assert.deepEqual(parseReference('1 cor 13', books), { bookId: '1corinthians', chapter: 13, verse: undefined });
  assert.deepEqual(parseReference('ps 23', books), { bookId: 'psalms', chapter: 23, verse: undefined });
  assert.deepEqual(parseReference('song of solomon 2:4', books)?.bookId, undefined); // multi-word names are searched as text
  assert.equal(parseReference('peace be still', books), null);
});

test('search: every word must match, phrases rank first', () => {
  const index = buildIndex([
    { bookId: 'john', chapters: [['¶In the beginning was the Word', 'The light shines in the darkness']] },
    { bookId: 'psalms', chapters: [['Be still, and know that I am God', 'Peace be with you in the beginning']] },
  ]);
  assert.equal(searchVerses(index, 'beginning').length, 2);
  assert.equal(searchVerses(index, 'beginning word').length, 1);
  assert.equal(searchVerses(index, 'in the beginning')[0].bookId, 'john');
  assert.equal(searchVerses(index, 'x').length, 0);
  assert.equal(searchVerses(index, 'zzzz').length, 0);
});

import { isPausedOn, pausedDatesSoFar, resumeEffect } from './pause.ts';

const ALL7 = [true, true, true, true, true, true, true];
const WEEKDAYS = [true, true, true, true, true, false, false];

test('pause: a fixed pause covers its days and ends by itself', () => {
  const s = { pausedFrom: '2026-10-22', pausedUntil: '2026-10-24' };
  assert.equal(isPausedOn(s, '2026-10-23'), true);
  assert.equal(isPausedOn(s, '2026-10-25'), false);
  assert.equal(isPausedOn({ pausedFrom: '2026-10-22', pausedUntil: null }, '2027-01-01'), true);
  assert.deepEqual(pausedDatesSoFar(s, '2026-10-23'), ['2026-10-22', '2026-10-23']);
  assert.deepEqual(pausedDatesSoFar(s, '2026-10-30'), ['2026-10-22', '2026-10-23', '2026-10-24']);
});

test('pause: resuming pushes the finish date by the lock days that were paused', () => {
  // Paused Thu 22 Oct to Mon 26 Oct, resumed Tue 27 Oct.
  const s = { pausedFrom: '2026-10-22', pausedUntil: null };
  const all = resumeEffect(s, '2026-10-27', ALL7);
  assert.equal(all.skipped.length, 5);
  assert.equal(all.extraActiveDays, 5);
  const wk = resumeEffect(s, '2026-10-27', WEEKDAYS); // Sat and Sun are rest days anyway
  assert.equal(wk.extraActiveDays, 3);
  assert.equal(resumeEffect(s, '2026-10-22', ALL7).skipped.length, 0); // resumed the same day
});

import { chunkText, paragraphs, spokenText } from './paragraphs.ts';

test('paragraphs: markers split paragraphs, verse numbers show once per verse', () => {
  const p = paragraphs(['¶In the beginning', 'God made it.', '¶A new paragraph here']);
  assert.equal(p.length, 2);
  assert.deepEqual(p[0].map((r) => [r.verse, r.showNum]), [[1, true], [2, true]]);
  assert.equal(p[1][0].verse, 3);
});

test('paragraphs: a verse that continues after a break keeps its number but shows it once', () => {
  const p = paragraphs(['First part ¶second part of the same verse']);
  assert.equal(p.length, 2);
  assert.deepEqual(p.flat().map((r) => [r.verse, r.showNum]), [[1, true], [1, false]]);
});

test('spoken text has no verse numbers and poetry lines become pauses', () => {
  const p = paragraphs(['¶Be still,\nand know that I am God']);
  assert.equal(spokenText(p[0]), 'Be still, and know that I am God');
});

test('long text is chunked at sentence ends', () => {
  const sentence = 'This is a sentence about faith. ';
  const text = sentence.repeat(200);
  const chunks = chunkText(text, 500);
  assert.ok(chunks.length > 5);
  assert.ok(chunks.every((c) => c.length <= 500));
  assert.equal(chunks.join(' ').replace(/\s+/g, ' ').trim(), text.replace(/\s+/g, ' ').trim());
});
