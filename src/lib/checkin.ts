// Daily check-in: how connected you feel, how you feel, an optional note, and a fitting verse.
export const CONNECTION = ['Distant', 'Dry', 'Okay', 'Close', 'Very close'] as const;
export const FEELINGS = ['Grateful', 'Peaceful', 'Anxious', 'Tired', 'Struggling', 'Joyful', 'Guilty', 'Lonely', 'Hopeful'] as const;

export type VerseRef = { bookId: string; chapter: number; verse: number; label: string };
type Pick = { ref: VerseRef; line: string };

const v = (bookId: string, label: string, chapter: number, verse: number): VerseRef => ({ bookId, chapter, verse, label });

// Single verses outside the Psalms, so the numbering matches in every translation.
const BY_FEELING: Record<string, Pick> = {
  Struggling: { ref: v('matthew', 'Matthew 11:28', 11, 28), line: 'You do not have to carry this alone. Rest is offered to you.' },
  Anxious: { ref: v('1peter', '1 Peter 5:7', 5, 7), line: 'Hand it over. You are cared for.' },
  Lonely: { ref: v('deuteronomy', 'Deuteronomy 31:6', 31, 6), line: 'You are not alone, even when it feels that way.' },
  Guilty: { ref: v('1john', '1 John 1:9', 1, 9), line: 'Forgiveness is waiting. You can start fresh today.' },
  Tired: { ref: v('matthew', 'Matthew 11:28', 11, 28), line: 'Be gentle with yourself. Rest counts.' },
  Grateful: { ref: v('1thessalonians', '1 Thessalonians 5:18', 5, 18), line: 'A grateful heart notices good things. Hold on to them.' },
  Joyful: { ref: v('philippians', 'Philippians 4:4', 4, 4), line: 'Let that joy fill your day.' },
  Hopeful: { ref: v('romans', 'Romans 15:13', 15, 13), line: 'Hope is a good place to walk from.' },
  Peaceful: { ref: v('john', 'John 14:27', 14, 27), line: 'Carry this peace with you today.' },
};
const BY_CONNECTION: Pick[] = [
  { ref: v('james', 'James 4:8', 4, 8), line: 'Feeling distant is real, and it is not the end. Come close, one step at a time.' },
  { ref: v('jeremiah', 'Jeremiah 29:13', 29, 13), line: 'Dry seasons come. Keep seeking. You are not behind.' },
  { ref: v('isaiah', 'Isaiah 40:31', 40, 31), line: 'Okay is a fine place to be. Strength comes as you keep going.' },
  { ref: v('john', 'John 15:5', 15, 5), line: 'Stay close. That is all it asks.' },
  { ref: v('1thessalonians', '1 Thessalonians 5:16', 5, 16), line: 'What a gift to feel this close. Enjoy it.' },
];
const PRIORITY = ['Struggling', 'Anxious', 'Lonely', 'Guilty', 'Tired'];

/** Picks one verse and a one-line encouragement. `connection` is 1 to 5. */
export function pickVerse(connection: number, feelings: string[]): Pick {
  for (const f of PRIORITY) if (feelings.includes(f) && BY_FEELING[f]) return BY_FEELING[f];
  if (connection <= 2) return BY_CONNECTION[connection - 1] ?? BY_CONNECTION[0];
  for (const f of ['Grateful', 'Joyful', 'Hopeful', 'Peaceful']) if (feelings.includes(f)) return BY_FEELING[f];
  return BY_CONNECTION[Math.min(Math.max(connection, 1), 5) - 1];
}

const CRISIS = /(kill myself|killing myself|end my life|ending my life|suicid|want to die|wanna die|don'?t want to (be here|live)|self[- ]?harm|hurt myself|harm myself|no reason to live|better off dead|end it all)/i;

/** True when a note may point to self-harm or crisis. */
export const looksLikeCrisis = (note: string) => CRISIS.test(note);

export const HELPLINES = [
  { place: 'United States', text: 'Call or text 988 (Suicide & Crisis Lifeline), any time.' },
  { place: 'India', text: 'Call Tele-MANAS on 14416, any time, in many languages.' },
  { place: 'Anywhere', text: 'If you are in immediate danger, call your local emergency number.' },
];
