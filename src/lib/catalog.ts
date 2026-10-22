// Themed reading plans. Each is a list of chapters from the bundled Bibles, so they work offline.
// Psalm numbers are the usual (Hebrew) ones; for the Douay-Rheims they are converted.
import type { Chapter } from './plan.ts';

export type PlanPart = [bookId: string, from: number, to?: number];
export type PlanGroup = 'Life of Jesus' | 'Wisdom and comfort' | 'Stories and letters' | 'Seasons' | 'Catholic books';
export type CatalogPlan = { id: string; title: string; blurb: string; group: PlanGroup; parts: PlanPart[] };

export const GROUPS: PlanGroup[] = ['Life of Jesus', 'Wisdom and comfort', 'Stories and letters', 'Seasons', 'Catholic books'];

export const CATALOG: CatalogPlan[] = [
  { id: 'sermon-on-the-mount', title: 'Sermon on the Mount', blurb: 'Jesus on blessing, prayer, worry and trust.', group: 'Life of Jesus', parts: [['matthew', 5, 7]] },
  { id: 'mark', title: 'Mark', blurb: 'The shortest Gospel, quick and vivid.', group: 'Life of Jesus', parts: [['mark', 1, 16]] },
  { id: 'john', title: 'John', blurb: 'Who Jesus is, and why it matters.', group: 'Life of Jesus', parts: [['john', 1, 21]] },
  { id: 'luke-acts', title: 'Luke and Acts', blurb: 'The life of Jesus, then the first Christians.', group: 'Life of Jesus', parts: [['luke', 1, 24], ['acts', 1, 28]] },
  { id: 'parables', title: 'Parables of Jesus', blurb: 'The stories he told, from the sower to the lost son.', group: 'Life of Jesus', parts: [['matthew', 13], ['matthew', 25], ['luke', 10], ['luke', 15], ['luke', 16], ['luke', 18]] },
  { id: 'holy-week', title: 'Holy Week and Easter', blurb: 'From the entry into Jerusalem to the empty tomb.', group: 'Life of Jesus', parts: [['mark', 11, 16]] },

  { id: 'psalms-hard-days', title: 'Psalms for hard days', blurb: 'Honest, steady words for when life is heavy.', group: 'Wisdom and comfort', parts: [['psalms', 23], ['psalms', 27], ['psalms', 34], ['psalms', 42], ['psalms', 46], ['psalms', 62], ['psalms', 91], ['psalms', 121], ['psalms', 130], ['psalms', 139]] },
  { id: 'psalms-praise', title: 'Psalms of praise', blurb: 'Joy and thanks, in song.', group: 'Wisdom and comfort', parts: [['psalms', 100], ['psalms', 103], ['psalms', 104], ['psalms', 145], ['psalms', 146], ['psalms', 147], ['psalms', 148], ['psalms', 150]] },
  { id: 'anxious', title: 'When you feel anxious', blurb: 'Rest for a worried mind.', group: 'Wisdom and comfort', parts: [['matthew', 6], ['john', 14], ['isaiah', 26], ['isaiah', 41], ['philippians', 4], ['1peter', 5]] },
  { id: 'proverbs', title: 'A month of Proverbs', blurb: 'One chapter a day of practical wisdom.', group: 'Wisdom and comfort', parts: [['proverbs', 1, 31]] },
  { id: 'ecclesiastes', title: 'Ecclesiastes', blurb: 'An honest look at meaning, time and work.', group: 'Wisdom and comfort', parts: [['ecclesiastes', 1, 12]] },

  { id: 'short-letters', title: 'Short letters', blurb: 'Philippians, Colossians, James, 1 Peter and 1 John.', group: 'Stories and letters', parts: [['philippians', 1, 4], ['colossians', 1, 4], ['james', 1, 5], ['1peter', 1, 5], ['1john', 1, 5]] },
  { id: 'romans', title: 'Romans', blurb: "Paul's clearest account of grace and faith.", group: 'Stories and letters', parts: [['romans', 1, 16]] },
  { id: 'genesis', title: 'Genesis', blurb: 'Beginnings: creation, Abraham, Joseph.', group: 'Stories and letters', parts: [['genesis', 1, 50]] },
  { id: 'men-of-faith', title: 'Men of faith', blurb: 'Abraham, Joseph, Moses, Joshua, David and Daniel.', group: 'Stories and letters', parts: [['genesis', 12], ['genesis', 15], ['genesis', 22], ['genesis', 37], ['genesis', 39], ['genesis', 45], ['exodus', 3], ['exodus', 14], ['joshua', 1], ['1samuel', 17], ['daniel', 3], ['daniel', 6]] },
  { id: 'women-of-faith', title: 'Women of the Bible', blurb: 'Hannah, Ruth, Esther, Mary and more.', group: 'Stories and letters', parts: [['1samuel', 1], ['ruth', 1, 4], ['esther', 4], ['luke', 1], ['john', 4], ['john', 20]] },

  { id: 'advent', title: 'Advent', blurb: 'Waiting for Christmas, with the prophets and the Gospels.', group: 'Seasons', parts: [['isaiah', 9], ['isaiah', 11], ['isaiah', 35], ['isaiah', 40], ['micah', 5], ['zechariah', 9], ['malachi', 3], ['luke', 1], ['luke', 2], ['matthew', 1], ['matthew', 2], ['john', 1]] },
  { id: 'christmas', title: 'The Christmas story', blurb: 'The birth of Jesus, told by Matthew, Luke and John.', group: 'Seasons', parts: [['matthew', 1, 2], ['luke', 1, 2], ['john', 1]] },
  { id: 'lent', title: 'Lent', blurb: 'Repentance, forgiveness and the road to the cross.', group: 'Seasons', parts: [['joel', 2], ['psalms', 51], ['isaiah', 58], ['matthew', 4], ['luke', 15], ['john', 3], ['romans', 5], ['romans', 8], ['isaiah', 53], ['mark', 14]] },

  { id: 'wisdom-solomon', title: 'Wisdom of Solomon', blurb: 'Praise of wisdom, and trust in God through trial.', group: 'Catholic books', parts: [['wisdom', 1, 19]] },
  { id: 'sirach', title: 'Sirach', blurb: 'Everyday wisdom for family, friendship and faith.', group: 'Catholic books', parts: [['sirach', 1, 51]] },
  { id: 'tobit-judith', title: 'Tobit and Judith', blurb: 'Two stories of faithfulness under pressure.', group: 'Catholic books', parts: [['tobit', 1, 14], ['judith', 1, 16]] },
];

/** Psalm chapters in the Douay-Rheims (Vulgate) numbering for a usual (Hebrew) Psalm number. */
export function psalmToVulgate(n: number): number[] {
  if (n <= 8 || n >= 148) return [n];
  if (n === 9 || n === 10) return [9];
  if (n === 114 || n === 115) return [113];
  if (n === 116) return [114, 115];
  if (n === 147) return [146, 147];
  return [n - 1];
}

export type BookLike = { id: string; name: string; words: number[] };

/** A plan's chapters in one translation. Empty when the translation lacks a book the plan needs. */
export function planChaptersFrom(plan: CatalogPlan, books: BookLike[], translation: string): Chapter[] {
  const byId = new Map(books.map((b) => [b.id, b]));
  const out: Chapter[] = [];
  for (const [bookId, from, to = from] of plan.parts) {
    const book = byId.get(bookId);
    if (!book) return [];
    for (let c = from; c <= to; c++) {
      const nums = bookId === 'psalms' && translation === 'drc' ? psalmToVulgate(c) : [c];
      for (const n of nums) {
        const words = book.words[n - 1];
        if (words === undefined) return [];
        if (!out.some((x) => x.bookId === bookId && x.chapter === n)) out.push({ bookId, bookName: book.name, chapter: n, words });
      }
    }
  }
  return out;
}

export const findPlan = (id: string) => CATALOG.find((p) => p.id === id);
