// Turns a chapter's verse strings into paragraphs for reading and listening.
// Markers (see scripts/build-web.mjs): "¶" starts a paragraph or stanza, a leading "\n" starts a line of poetry.
export type Run = { verse: number; showNum: boolean; text: string };

export function paragraphs(verses: string[]): Run[][] {
  const out: Run[][] = [[]];
  verses.forEach((v, i) => {
    let numbered = false;
    v.split('¶').forEach((part, k) => {
      if (k > 0 && out[out.length - 1].length) out.push([]);
      const text = part.replace(/^\n/, '');
      if (!text.trim()) return;
      const cur = out[out.length - 1];
      cur.push({ verse: i + 1, showNum: !numbered, text: (part.startsWith('\n') && cur.length ? '\n' : '') + text });
      numbered = true;
    });
  });
  return out.filter((p) => p.length);
}

/** The words to speak for a paragraph: no verse numbers, poetry lines joined with pauses. */
export const spokenText = (p: Run[]) => p.map((r) => r.text.replace(/\s*\n\s*/g, ', ').trim()).join(' ').replace(/,\s*,/g, ',');

/** Splits long text at sentence ends so it stays under the phone's text-to-speech limit. */
export function chunkText(text: string, max = 2500): string[] {
  if (text.length <= max) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > max) {
    let cut = Math.max(rest.lastIndexOf('. ', max), rest.lastIndexOf('; ', max), rest.lastIndexOf(', ', max));
    if (cut < max * 0.4) cut = rest.lastIndexOf(' ', max);
    if (cut <= 0) cut = max;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1);
  }
  if (rest.trim()) parts.push(rest.trim());
  return parts;
}
