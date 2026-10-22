// Offline search: by reference ("John 3:16") or by words in the verse text.
export type VerseEntry = { bookId: string; chapter: number; verse: number; text: string; lower: string };
export type BookRef = { id: string; name: string };
export type Hit = { bookId: string; chapter: number; verse: number; text: string };

const clean = (s: string) => s.replace(/[¶\n]+/g, ' ').replace(/\s+/g, ' ').trim();
const letters = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function buildIndex(books: { bookId: string; chapters: string[][] }[]): VerseEntry[] {
  const out: VerseEntry[] = [];
  for (const b of books) {
    b.chapters.forEach((verses, ci) =>
      verses.forEach((raw, vi) => {
        const text = clean(raw);
        if (text) out.push({ bookId: b.bookId, chapter: ci + 1, verse: vi + 1, text, lower: text.toLowerCase().replace(/[‘’]/g, "'") });
      }),
    );
  }
  return out;
}

// Common short forms people type for a book.
const ALIASES: Record<string, string> = {
  gen: 'genesis', ex: 'exodus', exo: 'exodus', lev: 'leviticus', num: 'numbers', deut: 'deuteronomy', dt: 'deuteronomy',
  josh: 'joshua', judg: 'judges', sam: 'samuel', kgs: 'kings', chr: 'chronicles', neh: 'nehemiah', esth: 'esther',
  ps: 'psalms', psa: 'psalms', psalm: 'psalms', prov: 'proverbs', pr: 'proverbs', eccl: 'ecclesiastes', eccles: 'ecclesiastes',
  song: 'songofsolomon', sos: 'songofsolomon', isa: 'isaiah', jer: 'jeremiah', lam: 'lamentations', ezek: 'ezekiel',
  dan: 'daniel', hos: 'hosea', obad: 'obadiah', mic: 'micah', nah: 'nahum', hab: 'habakkuk', zeph: 'zephaniah',
  hag: 'haggai', zech: 'zechariah', mal: 'malachi', matt: 'matthew', mt: 'matthew', mk: 'mark', lk: 'luke', jn: 'john',
  rom: 'romans', cor: 'corinthians', gal: 'galatians', eph: 'ephesians', phil: 'philippians', col: 'colossians',
  thess: 'thessalonians', thes: 'thessalonians', tim: 'timothy', tit: 'titus', philem: 'philemon', heb: 'hebrews',
  jas: 'james', pet: 'peter', rev: 'revelation',
};

/** "John 3:16", "1 cor 13", "ps 23" -> a place in the Bible, or null when it is not a reference. */
export function parseReference(query: string, books: BookRef[]): { bookId: string; chapter: number; verse?: number } | null {
  const m = query.trim().toLowerCase().match(/^(\d?)\s*([a-z]+)\.?\s+(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?$/);
  if (!m) return null;
  const [, num, word, ch, vs] = m;
  const key = `${num}${ALIASES[word] ?? word}`;
  const hit =
    books.find((b) => letters(b.name) === key || b.id === key) ??
    books.find((b) => letters(b.name).startsWith(key)) ??
    (num === '' ? books.find((b) => letters(b.name).replace(/^\d/, '').startsWith(ALIASES[word] ?? word)) : undefined);
  if (!hit) return null;
  return { bookId: hit.id, chapter: Number(ch), verse: vs ? Number(vs) : undefined };
}

/** Every word must appear in the verse. Whole phrases and earlier matches rank higher. */
export function searchVerses(index: VerseEntry[], query: string, limit = 60): Hit[] {
  const q = query.trim().toLowerCase().replace(/[‘’]/g, "'");
  const words = q.split(/\s+/).filter((w) => w.length > 0);
  if (!q || (words.length === 1 && words[0].length < 2)) return [];
  const scored: { s: number; e: VerseEntry }[] = [];
  for (const e of index) {
    if (!words.every((w) => e.lower.includes(w))) continue;
    const phrase = words.length > 1 && e.lower.includes(q) ? 1000 : 0;
    const at = e.lower.indexOf(words[0]);
    scored.push({ s: phrase - at - e.text.length / 100, e });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map(({ e }) => ({ bookId: e.bookId, chapter: e.chapter, verse: e.verse, text: e.text }));
}
