// Sends the streak and the next two weeks of verses to the Android home-screen widget.
import { chapterVerses, refLabel, unquote } from './bible';
import { native } from './lock';
import type { OnboardingState } from './onboarding';
import { effectiveSkipped } from './progress';
import { addDays, fromIso, iso, streak } from './schedule';
import { verseOfDay } from './votd';

const DAYS_AHEAD = 14;

export function syncWidget(s: OnboardingState) {
  if (!native || !s.completed) return;
  try {
    const now = new Date();
    const today = iso(now);
    const days: Record<string, { t: string; r: string }> = {};
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = iso(addDays(now, i));
      const [book, chapter, verse] = verseOfDay(date, s.translation);
      const text = (chapterVerses(s.translation, book, chapter)[verse - 1] ?? '').replace(/[¶\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (text) days[date] = { t: text, r: refLabel(s.translation, book, chapter, verse) };
    }
    const run = streak(s.doneDates, s.lockDays, now, s.startedOn ? fromIso(s.startedOn) : now, effectiveSkipped(s, today));
    native.updateWidget(JSON.stringify({ streak: run, days }));
  } catch {
    // The widget is a nicety; never crash the app over it.
  }
}
