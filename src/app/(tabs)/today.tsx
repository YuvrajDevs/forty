import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { dueCards } from '../../lib/memory';
import { useOnboarding } from '../../lib/onboarding';
import { behindBy, effectiveSkipped, ensureDayPlan, extendDeadline, getToday, resumePlan, settlePause, skipToday } from '../../lib/progress';
import { fromIso, streak } from '../../lib/schedule';
import { scopeTitle } from '../../lib/scopes';
import { colors, fonts, radius, spacing } from '../../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.';
};

export default function Today() {
  const s = useOnboarding();
  useEffect(() => {
    settlePause();
    ensureDayPlan();
  }, []);
  const t = getToday(s);
  const title = scopeTitle(s.scope);
  const now = new Date();
  const run = streak(s.doneDates, s.lockDays, now, s.startedOn ? fromIso(s.startedOn) : now, effectiveSkipped(s, t.date));
  const memoryDue = dueCards(s.memory, t.date).length;
  const behind = t.active && !t.finished ? behindBy(s) : 0;
  const totalChapters = t.chaptersRead + t.unreadChapters.length;
  const done = t.chaptersRead;
  const pct = totalChapters ? (done / totalChapters) * 100 : 0;
  const allDone = t.readings.length > 0 && t.nextIndex === -1;
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>FORTYBIBLE</Text>
          <Pressable accessibilityLabel="Settings" hitSlop={12} onPress={() => router.push('/settings')} style={styles.gear}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
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

        {behind > 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>You're {behind} {behind === 1 ? 'day' : 'days'} behind. Today you have {t.readings.length} {t.readings.length === 1 ? 'reading' : 'readings'}.</Text>
            <Text style={styles.bannerText}>Let's pick this up today, or give yourself more time.</Text>
            <Pressable accessibilityRole="button" onPress={extendDeadline} style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Extend my deadline</Text>
            </Pressable>
          </View>
        ) : null}
        <Text style={styles.section}>Today's readings</Text>
        {t.finished ? (
          <Text style={styles.empty}>You have finished {title}. Well done. Pick a new plan in the Plan tab.</Text>
        ) : t.paused ? (
          <View>
            <Text style={styles.empty}>
              Your plan is paused{s.pausedUntil ? ` until ${fromIso(s.pausedUntil).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}` : ''}. Your apps stay open and your streak is safe.
            </Text>
            <Pressable onPress={resumePlan} style={styles.link}><Text style={styles.linkText}>Resume now</Text></Pressable>
          </View>
        ) : t.skipped ? (
          <View>
            <Text style={styles.empty}>You skipped today. Your apps stay open, and your streak is safe. See you tomorrow.</Text>
            <Pressable onPress={() => skipToday(false)} style={styles.link}><Text style={styles.linkText}>Undo skip</Text></Pressable>
          </View>
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
        {t.active && !t.finished && !allDone && t.readings.length > 0 ? (
          <Pressable onPress={() => skipToday(true)} style={styles.link}><Text style={styles.linkText}>Skip today</Text></Pressable>
        ) : null}
        {allDone ? <Text style={styles.empty}>All done for today. Your apps are unlocked. See you tomorrow.</Text> : null}
        {memoryDue > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/memory')} style={styles.memory}>
            <Text style={styles.memoryText}>{memoryDue} {memoryDue === 1 ? 'verse' : 'verses'} to review</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        {!s.checkins.some((c) => c.date === t.date) ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/checkin')} style={styles.checkin}>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkinTitle}>How is your heart today?</Text>
              <Text style={styles.cardHint}>A 30-second check-in. Skip any time.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </ScrollView>
      {!allDone && t.active && !t.skipped && !t.paused && !t.finished && t.readings.length > 0 ? (
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 36 },
  gear: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
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
  memory: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: radius.card, paddingVertical: 16, paddingHorizontal: 20 },
  memoryText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  checkin: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: 20 },
  checkinTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  banner: { marginTop: spacing.lg, backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 18 },
  bannerTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.text },
  bannerText: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  bannerBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 10, paddingHorizontal: 18 },
  bannerBtnText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  link: { alignSelf: 'center', padding: 12 },
  linkText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textDecorationLine: 'underline' },
  empty: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
});
