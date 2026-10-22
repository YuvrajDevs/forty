import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ChapterText, paragraphsFor } from '../components/ChapterText';
import { VerseSheet } from '../components/VerseSheet';
import { useAudio } from '../lib/audio';
import type { AudioItem } from '../lib/audio';
import { booksFor, translationName } from '../lib/bible';
import { openApp } from '../lib/lock';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import { chunkText, spokenText } from '../lib/paragraphs';
import { getToday, markChaptersRead } from '../lib/progress';
import { key } from '../lib/today';
import { colors, fonts, spacing } from '../theme';

type Ref = { bookId: string; bookName: string; chapter: number };

const MIN_SIZE = 16;
const MAX_SIZE = 28;
const RATES = [0.8, 1, 1.2, 1.5];

export default function Reader() {
  const params = useLocalSearchParams<{ mode?: string; book?: string; chapter?: string; verse?: string; lock?: string }>();
  const s = useOnboarding();
  const plan = params.mode === 'plan';
  const [freeChapter, setFreeChapter] = useState(Number(params.chapter ?? 1));
  const [atEnd, setAtEnd] = useState(false);
  const [waited, setWaited] = useState(false);
  const [sheet, setSheet] = useState<{ bookId: string; chapter: number; verse: number } | null>(null);
  const [flash, setFlash] = useState<number | undefined>(params.verse ? Number(params.verse) : undefined);
  const size = s.readerFontSize;

  const today = getToday(s);
  const reading = plan && today.nextIndex >= 0 ? today.readings[today.nextIndex] : undefined;
  const book = booksFor(s.translation).find((b) => b.id === params.book);

  const refs: Ref[] = useMemo(() => {
    if (plan) return (reading?.chapters ?? []).map((c) => ({ bookId: c.bookId, bookName: c.bookName, chapter: c.chapter }));
    return book ? [{ bookId: book.id, bookName: book.name, chapter: freeChapter }] : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, reading?.label, book?.id, freeChapter]);

  // What audio mode reads: each chapter's name, then its paragraphs.
  const items: AudioItem[] = useMemo(() => {
    const out: AudioItem[] = [];
    refs.forEach((r, ci) => {
      out.push({ text: `${r.bookName}, chapter ${r.chapter}.`, chapterIdx: ci, paraIdx: -1 });
      paragraphsFor(s.translation, r.bookId, r.chapter).forEach((p, pi) =>
        chunkText(spokenText(p)).forEach((t) => out.push({ text: t, chapterIdx: ci, paraIdx: pi })),
      );
    });
    return out;
  }, [refs, s.translation]);
  const audio = useAudio(items, s.audioRate);

  // Positions, so the page can follow the voice and jump to a searched verse.
  const scroller = useRef<ScrollView>(null);
  const chapterY = useRef<Record<number, number>>({});
  const paraY = useRef<Record<string, number>>({});
  const scrollToPara = useCallback((ci: number, pi: number) => {
    const y = (chapterY.current[ci] ?? 0) + (pi >= 0 ? paraY.current[`${ci}-${pi}`] ?? 0 : 0);
    scroller.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
  }, []);

  useEffect(() => {
    if (audio.current && audio.current.paraIdx >= 0) scrollToPara(audio.current.chapterIdx, audio.current.paraIdx);
    else if (audio.current) scrollToPara(audio.current.chapterIdx, -1);
  }, [audio.current?.chapterIdx, audio.current?.paraIdx, scrollToPara]);

  // Opened from search or Saved: scroll to the verse and mark it briefly.
  useEffect(() => {
    if (!params.verse || !refs[0]) return;
    const target = Number(params.verse);
    const paras = paragraphsFor(s.translation, refs[0].bookId, refs[0].chapter);
    const pi = paras.findIndex((p) => p.some((r) => r.verse === target));
    const wait = setTimeout(() => pi >= 0 && scrollToPara(0, pi), 350);
    const clear = setTimeout(() => setFlash(undefined), 3500);
    return () => {
      clearTimeout(wait);
      clearTimeout(clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.verse, refs[0]?.bookId, refs[0]?.chapter]);

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
  const cycleRate = () => setOnboarding({ audioRate: RATES[(RATES.indexOf(s.audioRate) + 1) % RATES.length] ?? 1 });
  const goChapter = (n: number) => {
    audio.close();
    setFlash(undefined);
    setFreeChapter(n);
    scroller.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
        <Pressable accessibilityLabel={audio.open ? 'Close audio' : 'Listen'} hitSlop={8} onPress={() => (audio.open ? audio.close() : audio.start(0))} style={[styles.sizeBtn, audio.open && styles.sizeBtnOn]}>
          <Ionicons name={audio.open ? 'volume-high' : 'volume-high-outline'} size={19} color={colors.text} />
        </Pressable>
        <Pressable accessibilityLabel="Smaller text" hitSlop={8} onPress={() => resize(-2)} style={styles.sizeBtn}>
          <Text style={[styles.sizeText, { fontSize: 14, lineHeight: 18 }]}>A</Text>
        </Pressable>
        <Pressable accessibilityLabel="Larger text" hitSlop={8} onPress={() => resize(2)} style={styles.sizeBtn}>
          <Text style={[styles.sizeText, { fontSize: 22, lineHeight: 26 }]}>A</Text>
        </Pressable>
      </View>

      <ScrollView ref={scroller} contentContainerStyle={styles.body} onScroll={onScroll} scrollEventThrottle={100} showsVerticalScrollIndicator={false}>
        {plan && !reading ? <Text style={[styles.empty, { fontSize: size, lineHeight: size * 1.75 }]}>Nothing left to read today.</Text> : null}
        {refs.map((r, ci) => (
          <ChapterText
            key={`${r.bookId}-${r.chapter}`}
            bookId={r.bookId}
            bookName={r.bookName}
            chapter={r.chapter}
            translation={s.translation}
            size={size}
            highlights={s.highlights}
            bookmarks={s.bookmarks}
            activePara={audio.current?.chapterIdx === ci && audio.current.paraIdx >= 0 ? audio.current.paraIdx : undefined}
            flashVerse={ci === 0 ? flash : undefined}
            onVerse={(verse) => setSheet({ bookId: r.bookId, chapter: r.chapter, verse })}
            onParagraphLayout={(pi, y) => (paraY.current[`${ci}-${pi}`] = y)}
            onChapterLayout={(y) => (chapterY.current[ci] = y)}
          />
        ))}
        <Text style={styles.credit}>{translationName(s.translation)}, public domain. Tap a verse to highlight, save or share it.</Text>
      </ScrollView>

      {audio.open ? (
        <View style={styles.player}>
          <Pressable accessibilityLabel="Previous paragraph" hitSlop={8} onPress={audio.prev} style={styles.playBtn}>
            <Ionicons name="play-skip-back" size={20} color={colors.text} />
          </Pressable>
          <Pressable accessibilityLabel={audio.playing ? 'Pause' : 'Play'} onPress={audio.playing ? audio.pause : audio.resume} style={[styles.playBtn, styles.playMain]}>
            <Ionicons name={audio.playing ? 'pause' : 'play'} size={24} color={colors.text} />
          </Pressable>
          <Pressable accessibilityLabel="Next paragraph" hitSlop={8} onPress={audio.next} style={styles.playBtn}>
            <Ionicons name="play-skip-forward" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.playerHint} numberOfLines={1}>Listening</Text>
          <Pressable accessibilityLabel="Change speed" hitSlop={8} onPress={cycleRate} style={styles.rate}>
            <Text style={styles.rateText}>{s.audioRate}×</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.footer}>
        {plan ? (
          <Button
            label={atEnd && waited ? "I've read this" : atEnd ? 'Take your time' : 'Keep reading'}
            disabled={!(atEnd && waited)}
            onPress={() => {
              audio.close();
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
              <Button compact variant="soft" label="Previous" disabled={freeChapter <= 1} onPress={() => goChapter(freeChapter - 1)} />
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
              <Button compact variant="soft" label="Next" disabled={freeChapter >= book.words.length} onPress={() => goChapter(freeChapter + 1)} />
            </View>
          </View>
        ) : null}
      </View>

      <VerseSheet target={sheet} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 56 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 15, lineHeight: 20, color: colors.textSecondary, includeFontPadding: false },
  sizeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  sizeBtnOn: { backgroundColor: colors.primary },
  sizeText: { fontFamily: fonts.scriptureBold, color: colors.text, includeFontPadding: false, textAlign: 'center' },
  body: { paddingHorizontal: 28, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  empty: { fontFamily: fonts.scripture, color: colors.text },
  credit: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  player: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.card, borderRadius: 30 },
  playBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  playMain: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary },
  playerHint: { flex: 1, marginLeft: 4, fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  rate: { height: 34, minWidth: 48, borderRadius: 17, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  rateText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
  pager: { flexDirection: 'row', gap: 10 },
});
