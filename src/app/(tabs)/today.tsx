import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { useOnboarding } from '../../lib/onboarding';
import { ensureDayPlan, getToday } from '../../lib/progress';
import { fromIso, streak } from '../../lib/schedule';
import { SCOPES } from '../../lib/scopes';
import { colors, fonts, radius, spacing } from '../../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.';
};

export default function Today() {
  const s = useOnboarding();
  useEffect(() => {
    ensureDayPlan();
  }, []);
  const t = getToday(s);
  const title = SCOPES.find((x) => x.id === s.scope)?.title ?? '';
  const now = new Date();
  const run = streak(s.doneDates, s.lockDays, now, s.startedOn ? fromIso(s.startedOn) : now);
  const totalChapters = t.chaptersRead + t.unreadChapters.length;
  const done = t.chaptersRead;
  const pct = totalChapters ? (done / totalChapters) * 100 : 0;
  const allDone = t.readings.length > 0 && t.nextIndex === -1;
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>FORTY</Text>
        <Text style={styles.title}>{greeting()}</Text>
        <Text style={styles.sub}>{date}</Text>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.cardSelected }]}>
            <Text style={styles.statNum}>{run}</Text>
            <Text style={styles.statLabel}>{run === 1 ? 'day streak' : 'day streak'}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: '#E3EBDD' }]}>
            <Text style={[styles.statNum, { color: colors.green }]}>{done}</Text>
            <Text style={styles.statLabel}>of {totalChapters} chapters</Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>{title} {'·'} {pct < 10 ? pct.toFixed(1) : Math.round(pct)}% read</Text>
        </View>

        <Text style={styles.section}>Today's readings</Text>
        {t.finished ? (
          <Text style={styles.empty}>You have finished {title}. Well done. Pick a new plan in the Plan tab.</Text>
        ) : !t.active ? (
          <Text style={styles.empty}>Today is a rest day. Your apps stay open. You can still read in the Read tab.</Text>
        ) : (
          t.readings.map((r, i) => {
            const isDone = t.done[i];
            const isNext = i === t.nextIndex;
            return (
              <Pressable
                key={i}
                disabled={!isNext}
                onPress={() => router.push('/reader?mode=plan')}
                style={[styles.card, isNext && styles.cardNext, isDone && styles.cardDone]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{r.label}</Text>
                  <Text style={styles.cardHint}>{r.minutes} min</Text>
                </View>
                <View style={[styles.radio, isDone && styles.radioOn]}>
                  {isDone ? <Text style={styles.tick}>{'✓'}</Text> : null}
                </View>
              </Pressable>
            );
          })
        )}
        {allDone ? <Text style={styles.empty}>All done for today. Your apps are unlocked. See you tomorrow.</Text> : null}
      </ScrollView>
      {!allDone && t.active && !t.finished && t.readings.length > 0 ? (
        <View style={styles.footer}>
          <Button label={t.doneCount === 0 ? 'Start reading' : 'Continue reading'} onPress={() => router.push('/reader?mode=plan')} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  sub: { marginTop: 6, fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  stats: { flexDirection: 'row', gap: 12, marginTop: spacing.lg },
  stat: { flex: 1, borderRadius: radius.card, padding: 18 },
  statNum: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 56, lineHeight: 58, color: colors.gold },
  statLabel: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  progressWrap: { marginTop: spacing.lg },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.green },
  progressText: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm, fontFamily: fonts.display, includeFontPadding: false, fontSize: 30, lineHeight: 32, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: 20, marginBottom: 12 },
  cardNext: { backgroundColor: colors.cardSelected },
  cardDone: { opacity: 0.6 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  cardHint: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#BDB398', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.green, borderColor: colors.green },
  tick: { color: '#FFFFFF', fontSize: 15, lineHeight: 18, fontFamily: fonts.semibold },
  empty: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
});
