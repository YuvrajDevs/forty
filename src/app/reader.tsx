import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { booksFor, chapterVerses, translationName } from '../lib/bible';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import { openApp } from '../lib/lock';
import { getToday, markChaptersRead } from '../lib/progress';
import { key } from '../lib/today';
import { colors, fonts, spacing } from '../theme';

type Ref = { bookId: string; bookName: string; chapter: number };
type Run = { num?: number; text: string };

const MIN_SIZE = 16;
const MAX_SIZE = 28;

/** Turns a chapter's verses into paragraphs; see scripts/build-web.mjs for the markers. */
function paragraphs(verses: string[]): Run[][] {
  const out: Run[][] = [[]];
  verses.forEach((v, i) => {
    let numbered = false;
    v.split('¶').forEach((part, k) => {
      if (k > 0 && out[out.length - 1].length) out.push([]);
      const text = part.replace(/^\n/, '');
      if (!text.trim()) return;
      out[out.length - 1].push({ num: numbered ? undefined : i + 1, text: (part.startsWith('\n') && out[out.length - 1].length ? '\n' : '') + text });
      numbered = true;
    });
  });
  return out.filter((p) => p.length);
}

export default function Reader() {
  const params = useLocalSearchParams<{ mode?: string; book?: string; chapter?: string; lock?: string }>();
  const s = useOnboarding();
  const plan = params.mode === 'plan';
  const [freeChapter, setFreeChapter] = useState(Number(params.chapter ?? 1));
  const [atEnd, setAtEnd] = useState(false);
  const [waited, setWaited] = useState(false);
  const size = s.readerFontSize;

  const today = getToday(s);
  const reading = plan && today.nextIndex >= 0 ? today.readings[today.nextIndex] : undefined;
  const book = booksFor(s.translation).find((b) => b.id === params.book);

  const refs: Ref[] = useMemo(() => {
    if (plan) return (reading?.chapters ?? []).map((c) => ({ bookId: c.bookId, bookName: c.bookName, chapter: c.chapter }));
    return book ? [{ bookId: book.id, bookName: book.name, chapter: freeChapter }] : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, reading?.label, book?.id, freeChapter]);

  // A short minimum so "I've read this" means something: a fraction of the estimated time, capped.
  const minSeconds = plan && reading ? Math.min(45, Math.round(reading.minutes * 60 * 0.25)) : 0;
  useEffect(() => {
    setAtEnd(false);
    setWaited(minSeconds === 0);
    if (!minSeconds) return;
    const id = setTimeout(() => setWaited(true), minSeconds * 1000);
    return () => clearTimeout(id);
  }, [reading?.label, minSeconds, freeChapter]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 80) setAtEnd(true);
  };

  const title = plan ? reading?.label ?? '' : book ? `${book.name} ${freeChapter}` : '';
  const isRead = book ? s.readChapters.includes(`${book.id}:${freeChapter}`) : false;
  const resize = (d: number) => setOnboarding({ readerFontSize: Math.max(MIN_SIZE, Math.min(MAX_SIZE, size + d)) });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
        <Pressable accessibilityLabel="Smaller text" hitSlop={8} onPress={() => resize(-2)} style={styles.sizeBtn}>
          <Text style={[styles.sizeText, { fontSize: 14, lineHeight: 18 }]}>A</Text>
        </Pressable>
        <Pressable accessibilityLabel="Larger text" hitSlop={8} onPress={() => resize(2)} style={styles.sizeBtn}>
          <Text style={[styles.sizeText, { fontSize: 22, lineHeight: 26 }]}>A</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} onScroll={onScroll} scrollEventThrottle={100} showsVerticalScrollIndicator={false}>
        {plan && !reading ? <Text style={[styles.verse, { fontSize: size, lineHeight: size * 1.75 }]}>Nothing left to read today.</Text> : null}
        {refs.map((r) => (
          <View key={`${r.bookId}-${r.chapter}`} style={styles.chapter}>
            <Text style={styles.chapterTitle}>{r.bookName} {r.chapter}</Text>
            {paragraphs(chapterVerses(s.translation, r.bookId, r.chapter)).map((p, pi) => (
              <Text key={pi} style={[styles.verse, { fontSize: size, lineHeight: size * 1.75 }]}>
                {p.map((run, ri) => (
                  <Text key={ri}>
                    {ri > 0 && !run.text.startsWith('\n') ? ' ' : ''}
                    {run.num ? <Text style={[styles.num, { fontSize: Math.round(size * 0.58) }]}>{run.num}{' '}</Text> : null}
                    {run.text}
                  </Text>
                ))}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.credit}>{translationName(s.translation)}, public domain.</Text>
      </ScrollView>
      <View style={styles.footer}>
        {plan ? (
          <Button
            label={atEnd && waited ? "I've read this" : atEnd ? 'Take your time' : 'Keep reading'}
            disabled={!(atEnd && waited)}
            onPress={() => {
              if (reading) markChaptersRead(reading.chapters.map(key));
              if (params.lock) {
                // Came from the lock: hand the person back to the app they opened.
                openApp(params.lock);
                router.replace('/today');
              } else router.back();
            }}
          />
        ) : book ? (
          <View style={styles.pager}>
            <View style={{ flex: 1 }}>
              <Button compact variant="soft" label="Previous" disabled={freeChapter <= 1} onPress={() => setFreeChapter((c) => c - 1)} />
            </View>
            <View style={{ flex: 1.3 }}>
              <Button
                compact
                variant={isRead ? 'done' : 'primary'}
                label={isRead ? 'Read ✓' : 'Read'}
                disabled={isRead}
                onPress={() => markChaptersRead([`${book.id}:${freeChapter}`])}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button compact variant="soft" label="Next" disabled={freeChapter >= book.words.length} onPress={() => setFreeChapter((c) => c + 1)} />
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 56 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: colors.textSecondary, includeFontPadding: false },
  sizeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  sizeText: { fontFamily: fonts.scriptureBold, color: colors.text, includeFontPadding: false, textAlign: 'center' },
  body: { paddingHorizontal: 28, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  chapter: { marginBottom: spacing.xl },
  chapterTitle: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 48, lineHeight: 50, color: colors.text, marginBottom: spacing.lg },
  verse: { fontFamily: fonts.scripture, color: colors.text, textAlign: 'left', marginBottom: 18, letterSpacing: 0.1 },
  num: { fontFamily: fonts.semibold, color: colors.gold },
  credit: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
  pager: { flexDirection: 'row', gap: 10 },
});
