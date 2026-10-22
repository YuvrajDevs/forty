import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from '../../components/Calendar';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';
import { currentLocksPerDay, getToday, pausePlan, resumePlan, setLockDays, setReadingDays, setReadingsPerDay } from '../../lib/progress';
import { fromIso, iso } from '../../lib/schedule';
import { chaptersFor, SCOPES, scopeTitle } from '../../lib/scopes';
import type { ScopeId } from '../../lib/scopes';
import { colors, fonts, radius, spacing } from '../../theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEADLINES = [14, 30, 60, 90, 180, 365];
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 || h === 24 ? 'AM' : 'PM'}`;
const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Plan() {
  const s = useOnboarding();
  const t = getToday(s);
  const locks = currentLocksPerDay(s);
  const finish = s.deadline ? fromIso(s.deadline) : null;
  const title = scopeTitle(s.scope);
  const [choosing, setChoosing] = useState(false);
  const paused = !!s.pausedFrom;

  const toggleDay = (i: number) => {
    const mask = s.lockDays.map((v, j) => (j === i ? !v : v));
    if (!mask.some(Boolean)) return Alert.alert('Keep at least one day', 'FortyBible needs at least one reading day a week.');
    setLockDays(mask);
  };

  const changeScope = (scope: ScopeId) => {
    if (scope === s.scope) return;
    Alert.alert('Change your plan?', `Chapters you have already read count towards it, and your streak is kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Change plan',
        onPress: () => {
          setOnboarding({ scope, dayPlan: null });
          setReadingDays(Math.min(s.days, 365));
        },
      },
    ]);
  };

  const step = (key: 'lockStartHour' | 'lockEndHour', delta: number) => {
    const v = s[key] + delta;
    if (key === 'lockStartHour' && (v < 0 || v >= s.lockEndHour)) return;
    if (key === 'lockEndHour' && (v > 24 || v <= s.lockStartHour)) return;
    setOnboarding({ [key]: v });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>FORTYBIBLE</Text>
        <Text style={styles.title}>Plan</Text>

        <View style={styles.summary}>
          <Text style={styles.sumLabel}>{title}</Text>
          <Text style={styles.sumDate}>{finish ? fmtDate(finish) : 'Not set'}</Text>
          <Text style={styles.sumHint}>
            Expected finish {'·'} {locks} {locks === 1 ? 'reading' : 'readings'} a day {'·'} {t.daysLeft} reading {t.daysLeft === 1 ? 'day' : 'days'} left
          </Text>
        </View>

        <Calendar doneDates={s.doneDates} lockDays={s.lockDays} startedOn={s.startedOn} deadline={s.deadline} />

        <Text style={styles.section}>Pace</Text>
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Readings a day</Text>
              <Text style={styles.cardHint}>About 5 minutes each. The finish date updates.</Text>
            </View>
            <Stepper value={String(locks)} onMinus={() => locks > 1 && setReadingsPerDay(locks - 1)} onPlus={() => locks < 6 && setReadingsPerDay(locks + 1)} />
          </View>
        </View>
        <Text style={styles.label}>Or finish within</Text>
        <View style={styles.chips}>
          {DEADLINES.map((d) => (
            <Pressable key={d} onPress={() => setReadingDays(d)} style={[styles.chip, t.daysLeft === d && styles.chipOn]}>
              <Text style={styles.chipText}>{d === 365 ? '1 year' : `${d} days`}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Lock days</Text>
        <Text style={styles.hint}>Tap the days your apps are locked until you read. Other days are rest days.</Text>
        <View style={styles.days}>
          {DAY_LETTERS.map((l, i) => (
            <Pressable key={i} accessibilityRole="checkbox" accessibilityLabel={DAY_NAMES[i]} accessibilityState={{ checked: s.lockDays[i] }} onPress={() => toggleDay(i)} style={[styles.day, s.lockDays[i] && styles.dayOn]}>
              <Text style={styles.dayText}>{l}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Timing</Text>
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <Text style={[styles.cardTitle, { flex: 1 }]}>Locks start at</Text>
            <Stepper value={hourLabel(s.lockStartHour)} onMinus={() => step('lockStartHour', -1)} onPlus={() => step('lockStartHour', 1)} />
          </View>
          <View style={[styles.stepRow, { marginTop: 14 }]}>
            <Text style={[styles.cardTitle, { flex: 1 }]}>Locks stop at</Text>
            <Stepper value={hourLabel(s.lockEndHour)} onMinus={() => step('lockEndHour', -1)} onPlus={() => step('lockEndHour', 1)} />
          </View>
        </View>
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.stepRow}>
            <Text style={[styles.cardTitle, { flex: 1 }]}>Time between readings</Text>
            <Text style={styles.gapValue}>{s.gapHours} {s.gapHours === 1 ? 'hour' : 'hours'}</Text>
          </View>
          <Slider
            style={{ marginTop: 8 }}
            minimumValue={1}
            maximumValue={12}
            step={1}
            value={s.gapHours}
            onValueChange={(v) => setOnboarding({ gapHours: v })}
            minimumTrackTintColor={colors.gold}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.gold}
            accessibilityLabel="Hours between readings"
          />
          <View style={styles.sliderEnds}>
            <Text style={styles.cardHint}>1 hr</Text>
            <Text style={styles.cardHint}>12 hrs</Text>
          </View>
          <Text style={[styles.cardHint, { marginTop: 8 }]}>
            Your first reading appears when you first open a locked app. The next one comes at least this long after you finish.
          </Text>
        </View>

        <Text style={styles.section}>Pause</Text>
        <View style={styles.card}>
          <View style={styles.stepRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{paused ? 'Plan paused' : 'Pause plan'}</Text>
              <Text style={styles.cardHint}>
                {paused
                  ? s.pausedUntil ? `Until ${fmtDate(fromIso(s.pausedUntil))}. Your streak is safe.` : 'Until you resume. Your streak is safe.'
                  : 'For travel or illness. Your apps stay open and your streak is safe.'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => (paused ? resumePlan() : setChoosing(!choosing))}
              style={styles.pill}
            >
              <Text style={styles.pillText}>{paused ? 'Resume' : choosing ? 'Cancel' : 'Pause'}</Text>
            </Pressable>
          </View>
          {!paused && choosing ? (
            <View style={[styles.chips, { marginTop: 14 }]}>
              {([['3 days', 3], ['1 week', 7], ['2 weeks', 14], ['Until I resume', null]] as const).map(([label, days]) => (
                <Pressable key={label} onPress={() => { pausePlan(days); setChoosing(false); }} style={styles.chipSoft}>
                  <Text style={styles.chipText}>{label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <Text style={styles.section}>Change plan</Text>
        <View style={styles.chips}>
          {SCOPES.map((o) => (
            <Pressable key={o.id} onPress={() => changeScope(o.id)} style={[styles.chip, s.scope === o.id && styles.chipOn]}>
              <Text style={styles.chipText}>{o.title}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/plans')} style={styles.more}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>More plans</Text>
            <Text style={styles.cardHint}>Sermon on the Mount, Psalms for hard days, Advent and more</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.hint}>{chaptersFor(s.scope, s.translation).length} chapters in your current plan.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function Stepper({ value, onMinus, onPlus }: { value: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityLabel="Decrease" hitSlop={8} onPress={onMinus} style={styles.stepBtn}><Text style={styles.stepBtnText}>{'−'}</Text></Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable accessibilityLabel="Increase" hitSlop={8} onPress={onPlus} style={styles.stepBtn}><Text style={styles.stepBtnText}>+</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  summary: { marginVertical: spacing.lg, backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 20 },
  sumLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  sumDate: { marginTop: 2, fontFamily: fonts.display, includeFontPadding: false, fontSize: 54, lineHeight: 56, color: colors.text },
  sumHint: { marginTop: 4, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm, fontFamily: fonts.display, includeFontPadding: false, fontSize: 32, lineHeight: 34, color: colors.text },
  hint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary, marginBottom: 10 },
  label: { marginTop: 14, marginBottom: 8, fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  cardHint: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  gapValue: { fontFamily: fonts.semibold, fontSize: 16, color: colors.gold },
  sliderEnds: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 24, color: colors.text },
  stepValue: { minWidth: 56, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: radius.button, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.primary },
  pill: { backgroundColor: colors.primary, borderRadius: radius.button, paddingVertical: 10, paddingHorizontal: 18 },
  pillText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  chipSoft: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.button, backgroundColor: colors.background },
  more: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: colors.card, borderRadius: radius.card, padding: 18 },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.primary },
  dayText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
});
