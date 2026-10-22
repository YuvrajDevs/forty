import { booksFor } from './bible';
import type { TranslationId } from './bible';
import { CATALOG, findPlan, planChaptersFrom } from './catalog';
import type { CatalogPlan } from './catalog';
import type { Chapter } from './plan';

export type ScopeId = 'gospels' | 'nt' | 'ot' | 'bible' | 'wisdom' | `book:${string}` | `plan:${string}`;

export const SCOPES: { id: 'gospels' | 'nt' | 'ot' | 'bible' | 'wisdom'; title: string }[] = [
  { id: 'gospels', title: 'The Gospels' },
  { id: 'nt', title: 'New Testament' },
  { id: 'ot', title: 'Old Testament' },
  { id: 'bible', title: 'Whole Bible' },
  { id: 'wisdom', title: 'Psalms and Proverbs' },
];

const GOSPELS = ['matthew', 'mark', 'luke', 'john'];
const WISDOM = ['psalms', 'proverbs'];

export function chaptersFor(scope: ScopeId, translation: TranslationId = 'web'): Chapter[] {
  if (scope.startsWith('plan:')) {
    const plan = findPlan(scope.slice('plan:'.length));
    return plan ? planChaptersFrom(plan, booksFor(translation), translation) : [];
  }
  const books = booksFor(translation).filter((b) => {
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

/** A friendly name for any plan: a built-in range, a themed plan, or a single book. */
export function scopeTitle(scope: ScopeId): string {
  if (scope.startsWith('plan:')) return findPlan(scope.slice('plan:'.length))?.title ?? 'Your plan';
  if (scope.startsWith('book:')) return scope.slice('book:'.length);
  return SCOPES.find((x) => x.id === scope)?.title ?? 'Your plan';
}

/** Themed plans that can be read in this translation (Catholic books need the Douay-Rheims). */
export function availablePlans(translation: TranslationId): CatalogPlan[] {
  return CATALOG.filter((p) => planChaptersFrom(p, booksFor(translation), translation).length > 0);
}
