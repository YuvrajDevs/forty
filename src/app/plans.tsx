import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { GROUPS } from '../lib/catalog';
import type { CatalogPlan } from '../lib/catalog';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import { SESSION_WORDS, summarize, finishDate } from '../lib/plan';
import { setReadingDays } from '../lib/progress';
import { availablePlans, chaptersFor } from '../lib/scopes';
import { colors, fonts, radius, spacing } from '../theme';

const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Plans() {
  const { translation, scope, readChapters } = useOnboarding();
  const plans = useMemo(() => availablePlans(translation), [translation]);
  const [picked, setPicked] = useState<CatalogPlan | null>(null);
  const [days, setDays] = useState(7);

  const info = (p: CatalogPlan) => {
    const chapters = chaptersFor(`plan:${p.id}`, translation);
    const words = chapters.reduce((n, c) => n + c.words, 0);
    const read = chapters.filter((c) => readChapters.includes(`${c.bookId}:${c.chapter}`)).length;
    return { chapters, words, read, minutes: Math.round(words / 240) };
  };

  const open = (p: CatalogPlan) => {
    // One reading a day by default; the person can change it.
    setDays(Math.max(1, Math.ceil(info(p).words / SESSION_WORDS)));
    setPicked(p);
  };

  const start = () => {
    if (!picked) return;
    const apply = () => {
      setOnboarding({ scope: `plan:${picked.id}`, dayPlan: null });
      setReadingDays(days);
      setPicked(null);
      router.back();
    };
    Alert.alert(`Start ${picked.title}?`, 'It replaces your current plan. Chapters you have already read count towards it, and your streak is kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start', onPress: apply },
    ]);
  };

  const detail = picked ? info(picked) : null;
  const sum = detail ? summarize(detail.chapters, days) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Plans</Text>
        <Text style={styles.sub}>Short, focused ways to read. Pick one and choose how fast.</Text>

        {GROUPS.map((g) => {
          const inGroup = plans.filter((p) => p.group === g);
          if (!inGroup.length) return null;
          return (
            <View key={g}>
              <Text style={styles.group}>{g}</Text>
              {inGroup.map((p) => {
                const i = info(p);
                const current = scope === `plan:${p.id}`;
                return (
                  <Pressable key={p.id} accessibilityRole="button" onPress={() => open(p)} style={[styles.card, current && styles.cardOn]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{p.title}</Text>
                      <Text style={styles.cardBlurb}>{p.blurb}</Text>
                      <Text style={styles.cardMeta}>
                        {i.chapters.length} {i.chapters.length === 1 ? 'chapter' : 'chapters'} {'·'} about {i.minutes < 60 ? `${i.minutes} min` : `${(i.minutes / 60).toFixed(1)} hours`}
                        {current ? ' · your plan' : i.read > 0 ? ` · ${i.read} read` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!picked} transparent animationType="slide" onRequestClose={() => setPicked(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPicked(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.grab} />
            <Text style={styles.sheetTitle}>{picked?.title}</Text>
            <Text style={styles.sheetBlurb}>{picked?.blurb}</Text>

            <View style={styles.stepper}>
              <Text style={styles.stepLabel}>Finish in</Text>
              <Pressable accessibilityLabel="Fewer days" hitSlop={8} onPress={() => setDays(Math.max(1, days - 1))} style={styles.stepBtn}><Text style={styles.stepBtnText}>{'−'}</Text></Pressable>
              <Text style={styles.stepValue}>{days} {days === 1 ? 'day' : 'days'}</Text>
              <Pressable accessibilityLabel="More days" hitSlop={8} onPress={() => setDays(Math.min(365, days + 1))} style={styles.stepBtn}><Text style={styles.stepBtnText}>+</Text></Pressable>
            </View>
            {sum ? (
              <Text style={styles.sheetMeta}>
                {sum.locksPerDay} {sum.locksPerDay === 1 ? 'reading' : 'readings'} a day, done by {fmt(finishDate(new Date(), days))}.
              </Text>
            ) : null}
            <View style={{ marginTop: spacing.md }}><Button label="Start this plan" onPress={start} /></View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 48, justifyContent: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  sub: { marginTop: 6, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  group: { marginTop: spacing.xl, marginBottom: spacing.sm, fontFamily: fonts.display, includeFontPadding: false, fontSize: 30, lineHeight: 32, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 10 },
  cardOn: { backgroundColor: colors.cardSelected },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  cardBlurb: { marginTop: 2, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  cardMeta: { marginTop: 6, fontFamily: fonts.medium, fontSize: 12, color: colors.gold },
  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.lg, paddingBottom: spacing.xl },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.md },
  sheetTitle: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 44, lineHeight: 46, color: colors.text },
  sheetBlurb: { marginTop: 4, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.lg },
  stepLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.medium, fontSize: 22, lineHeight: 26, color: colors.text },
  stepValue: { minWidth: 84, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  sheetMeta: { marginTop: 10, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
});
