import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseVerseKey, refLabel, verseText } from '../lib/bible';
import { dueCards } from '../lib/memory';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import { fromIso, iso } from '../lib/schedule';
import { fonts, radius, spacing, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

type Tab = 'saved' | 'highlights' | 'memorize';
const TABS: { id: Tab; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'memorize', label: 'Memorize' },
];

const when = (due: string, today: string) => {
  if (due <= today) return 'Due today';
  const days = Math.round((fromIso(due).getTime() - fromIso(today).getTime()) / 86_400_000);
  return days === 1 ? 'Due tomorrow' : `Due in ${days} days`;
};

export default function Saved() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const s = useOnboarding();
  const [tab, setTab] = useState<Tab>('saved');
  const today = iso(new Date());
  const due = dueCards(s.memory, today).length;

  const open = (key: string) => {
    const { bookId, chapter, verse } = parseVerseKey(key);
    router.push(`/reader?mode=free&book=${bookId}&chapter=${chapter}&verse=${verse}`);
  };

  const rows: { key: string; extra?: string; color?: string; onRemove: () => void }[] =
    tab === 'saved'
      ? [...s.bookmarks].reverse().map((k) => ({ key: k, onRemove: () => setOnboarding({ bookmarks: s.bookmarks.filter((b) => b !== k) }) }))
      : tab === 'highlights'
        ? Object.entries(s.highlights).reverse().map(([k, c]) => ({
            key: k,
            color: colors.highlight[c],
            onRemove: () => {
              const next = { ...s.highlights };
              delete next[k];
              setOnboarding({ highlights: next });
            },
          }))
        : s.memory.map((c) => ({ key: c.key, extra: when(c.due, today), onRemove: () => setOnboarding({ memory: s.memory.filter((m) => m.key !== c.key) }) }));

  const emptyText =
    tab === 'saved'
      ? 'Tap any verse while reading, then Save, and it will show up here.'
      : tab === 'highlights'
        ? 'Tap a verse and pick a colour to highlight it.'
        : 'Tap a verse and choose Memorize. Short reviews bring it back just before you forget it.';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your verses</Text>
        <View style={styles.seg}>
          {TABS.map((t) => (
            <Pressable key={t.id} accessibilityRole="tab" accessibilityState={{ selected: tab === t.id }} onPress={() => setTab(t.id)} style={[styles.segItem, tab === t.id && styles.segOn]}>
              <Text style={[styles.segText, tab === t.id && styles.onPrimary]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'memorize' && s.memory.length > 0 ? (
          <Pressable disabled={due === 0} onPress={() => router.push('/memory')} style={[styles.review, due === 0 && { opacity: 0.55 }]}>
            <Text style={styles.reviewText}>{due > 0 ? `Review ${due} ${due === 1 ? 'verse' : 'verses'}` : 'All caught up'}</Text>
            {due > 0 ? <Ionicons name="chevron-forward" size={18} color={colors.text} /> : null}
          </Pressable>
        ) : null}

        {rows.length === 0 ? <Text style={styles.empty}>{emptyText}</Text> : null}

        {rows.map((r) => {
          const { bookId, chapter, verse } = parseVerseKey(r.key);
          return (
            <Pressable key={r.key} onPress={() => open(r.key)} style={styles.row}>
              {r.color ? <View style={[styles.swatch, { backgroundColor: r.color }]} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.ref}>{refLabel(s.translation, bookId, chapter, verse)}{r.extra ? `  ·  ${r.extra}` : ''}</Text>
                <Text style={styles.text} numberOfLines={2}>{verseText(s.translation, bookId, chapter, verse)}</Text>
              </View>
              <Pressable accessibilityLabel="Remove" hitSlop={10} onPress={r.onRemove}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 48, justifyContent: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 56, lineHeight: 58, color: colors.text },
  seg: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.button, padding: 4, marginVertical: spacing.lg },
  segItem: { flex: 1, height: 42, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.primary },
  onPrimary: { color: colors.onPrimary },
  segText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  review: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 18, marginBottom: spacing.md },
  reviewText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  empty: { marginTop: spacing.md, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.card, padding: 16, marginBottom: 10 },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  ref: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold, marginBottom: 2 },
  text: { fontFamily: fonts.scripture, fontSize: 14, lineHeight: 21, color: colors.text },
});
