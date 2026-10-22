import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { chapterVerses } from '../lib/bible';
import type { TranslationId } from '../lib/bible';
import type { HighlightColor } from '../lib/onboarding';
import { paragraphs } from '../lib/paragraphs';
import type { Run } from '../lib/paragraphs';
import { colors, fonts, spacing } from '../theme';

export const HIGHLIGHTS: Record<HighlightColor, string> = { gold: '#F6E3A1', green: '#D6E6CE', rose: '#F4D5D0' };

type Props = {
  bookId: string;
  bookName: string;
  chapter: number;
  translation: TranslationId;
  size: number;
  highlights: Record<string, HighlightColor>;
  bookmarks: string[];
  /** Paragraph being read aloud, if any. */
  activePara?: number;
  /** A verse to flash, such as the one a search result points to. */
  flashVerse?: number;
  onVerse: (verse: number) => void;
  onParagraphLayout?: (paraIdx: number, y: number) => void;
  onChapterLayout?: (y: number) => void;
};

export const paragraphsFor = (t: TranslationId, bookId: string, chapter: number): Run[][] =>
  paragraphs(chapterVerses(t, bookId, chapter));

function ChapterTextBase({ bookId, bookName, chapter, translation, size, highlights, bookmarks, activePara, flashVerse, onVerse, onParagraphLayout, onChapterLayout }: Props) {
  const paras = paragraphsFor(translation, bookId, chapter);
  const marked = new Set(bookmarks);
  return (
    <View style={styles.chapter} onLayout={(e) => onChapterLayout?.(e.nativeEvent.layout.y)}>
      <Text style={styles.title}>{bookName} {chapter}</Text>
      {paras.map((p, pi) => (
        <View key={pi} onLayout={(e) => onParagraphLayout?.(pi, e.nativeEvent.layout.y)} style={[styles.para, activePara === pi && styles.paraActive]}>
          <Text style={[styles.verse, { fontSize: size, lineHeight: size * 1.75 }]}>
            {p.map((run, ri) => {
              const k = `${bookId}:${chapter}:${run.verse}`;
              const hl = highlights[k];
              return (
                <Text
                  key={ri}
                  onPress={() => onVerse(run.verse)}
                  style={[hl && { backgroundColor: HIGHLIGHTS[hl] }, flashVerse === run.verse && styles.flash]}
                >
                  {ri > 0 && !run.text.startsWith('\n') ? ' ' : ''}
                  {run.showNum ? <Text style={[styles.num, { fontSize: Math.round(size * 0.58) }, marked.has(k) && styles.numSaved]}>{run.verse} </Text> : null}
                  {run.text}
                </Text>
              );
            })}
          </Text>
        </View>
      ))}
    </View>
  );
}

export const ChapterText = memo(ChapterTextBase);

const styles = StyleSheet.create({
  chapter: { marginBottom: spacing.xl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 48, lineHeight: 50, color: colors.text, marginBottom: spacing.lg },
  para: { marginBottom: 12, marginHorizontal: -10, paddingHorizontal: 10, borderRadius: 12 },
  paraActive: { backgroundColor: 'rgba(245, 200, 66, 0.22)' },
  verse: { fontFamily: fonts.scripture, color: colors.text, textAlign: 'left', letterSpacing: 0.1 },
  num: { fontFamily: fonts.semibold, color: colors.gold },
  numSaved: { color: colors.green },
  flash: { backgroundColor: 'rgba(245, 200, 66, 0.5)' },
});
