import { BOOKS as WEB_BOOKS } from '../data/books';
import type { BookMeta } from '../data/books';
import { LOADERS as DRC } from '../data/drc';
import { LOADERS as KJV } from '../data/kjv';
import { DRC_BOOKS, KJV_BOOKS } from '../data/translations-meta';
import { LOADERS as WEB } from '../data/web';

export type TranslationId = 'web' | 'kjv' | 'drc';

export const TRANSLATIONS: { id: TranslationId; name: string; short: string; note: string }[] = [
  { id: 'web', name: 'World English Bible', short: 'WEB', note: 'Modern English. 66 books.' },
  { id: 'kjv', name: 'King James Version', short: 'KJV', note: 'Traditional English. 66 books.' },
  { id: 'drc', name: 'Douay-Rheims (Challoner)', short: 'DRB', note: 'Catholic canon. 73 books.' },
];

const BOOKS: Record<TranslationId, BookMeta[]> = { web: WEB_BOOKS, kjv: KJV_BOOKS, drc: DRC_BOOKS };
const LOADERS: Record<TranslationId, Record<string, () => string[][]>> = { web: WEB, kjv: KJV, drc: DRC };

export const booksFor = (t: TranslationId): BookMeta[] => BOOKS[t] ?? WEB_BOOKS;

const cache = new Map<string, string[][]>();

/** Verses of one chapter, in the order of the translation. Paragraph markers are kept (see reader). */
export function chapterVerses(t: TranslationId, bookId: string, chapter: number): string[] {
  const k = `${t}:${bookId}`;
  let book = cache.get(k);
  if (!book) {
    book = (LOADERS[t] ?? WEB)[bookId]?.();
    if (book) cache.set(k, book);
  }
  return book?.[chapter - 1] ?? [];
}

/** One verse as plain text, for quoting. */
export function verseText(t: TranslationId, bookId: string, chapter: number, verse: number): string {
  return (chapterVerses(t, bookId, chapter)[verse - 1] ?? '').replace(/[¶]/g, '').replace(/\s+/g, ' ').trim();
}

export const translationName = (t: TranslationId) => TRANSLATIONS.find((x) => x.id === t)?.name ?? '';

/** "John 3:16" for a verse key's parts, using the book's name in this translation. */
export function refLabel(t: TranslationId, bookId: string, chapter: number, verse: number): string {
  const name = booksFor(t).find((b) => b.id === bookId)?.name ?? bookId;
  return `${name} ${chapter}:${verse}`;
}

export const verseKey = (bookId: string, chapter: number, verse: number) => `${bookId}:${chapter}:${verse}`;

export function parseVerseKey(key: string): { bookId: string; chapter: number; verse: number } {
  const [bookId, c, v] = key.split(':');
  return { bookId, chapter: Number(c), verse: Number(v) };
}

let searchIndex: { t: TranslationId; index: import('./search').VerseEntry[] } | null = null;

/** Builds (once per translation) the in-memory list of every verse, for offline search. */
export function getSearchIndex(t: TranslationId): import('./search').VerseEntry[] {
  if (searchIndex?.t === t) return searchIndex.index;
  const { buildIndex } = require('./search') as typeof import('./search');
  const index = buildIndex(
    booksFor(t).map((b) => ({
      bookId: b.id,
      chapters: b.words.map((_, i) => chapterVerses(t, b.id, i + 1)),
    })),
  );
  searchIndex = { t, index };
  return index;
}
