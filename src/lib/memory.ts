// Memory verses: a simple spaced-repetition deck (Leitner boxes). Dates are yyyy-mm-dd.
export type MemoryCard = { key: string; box: number; due: string };

/** Days until a card comes back, by box. A correct answer moves it up a box. */
export const INTERVALS = [1, 2, 4, 7, 14, 30];

const plus = (date: string, days: number) => {
  const [y, m, d] = date.split('-').map(Number);
  const r = new Date(y, m - 1, d + days);
  return `${r.getFullYear()}-${String(r.getMonth() + 1).padStart(2, '0')}-${String(r.getDate()).padStart(2, '0')}`;
};

export const addCard = (cards: MemoryCard[], key: string, today: string): MemoryCard[] =>
  cards.some((c) => c.key === key) ? cards : [...cards, { key, box: 0, due: today }];

export const removeCard = (cards: MemoryCard[], key: string): MemoryCard[] => cards.filter((c) => c.key !== key);

export const dueCards = (cards: MemoryCard[], today: string): MemoryCard[] =>
  cards.filter((c) => c.due <= today).sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));

/** Records one review. "Got it" moves the card up a box; "Again" sends it back to the start. */
export function review(cards: MemoryCard[], key: string, gotIt: boolean, today: string): MemoryCard[] {
  return cards.map((c) => {
    if (c.key !== key) return c;
    const box = gotIt ? Math.min(c.box + 1, INTERVALS.length - 1) : 0;
    return { key, box, due: plus(today, gotIt ? INTERVALS[box] : 1) };
  });
}
