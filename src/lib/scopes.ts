import { BOOKS } from '../data/books';
import type { Chapter } from './plan';

export type ScopeId = 'gospels' | 'nt' | 'ot' | 'bible' | 'wisdom' | `book:${string}`;

export const SCOPES: { id: Exclude<ScopeId, `book:${string}`>; title: string }[] = [
  { id: 'gospels', title: 'The Gospels' },
  { id: 'nt', title: 'New Testament' },
  { id: 'ot', title: 'Old Testament' },
  { id: 'bible', title: 'Whole Bible' },
  { id: 'wisdom', title: 'Psalms and Proverbs' },
];

const GOSPELS = ['matthew', 'mark', 'luke', 'john'];
const WISDOM = ['psalms', 'proverbs'];

export function chaptersFor(scope: ScopeId): Chapter[] {
  const books = BOOKS.filter((b) => {
    if (scope === 'bible') return true;
    if (scope === 'nt') return b.testament === 'nt';
    if (scope === 'ot') return b.testament === 'ot';
    if (scope === 'gospels') return GOSPELS.includes(b.id);
    if (scope === 'wisdom') return WISDOM.includes(b.id);
    return b.id === scope.slice('book:'.length);
  });
  return books.flatMap((b) =>
    b.words.map((words, i) => ({ bookId: b.id, bookName: b.name, chapter: i + 1, words })),
  );
}
