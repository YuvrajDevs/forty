import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';
import { buildPlan, finishDate, summarize } from '../../lib/plan';
import { chaptersFor, scopeTitle } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

const PRESETS = [7, 14, 30, 60, 90, 180, 365];
const label = (d: number) => (d === 365 ? '1 year' : `${d} days`);

export default function Days() {
  const { scope, days, translation } = useOnboarding();
  const chapters = chaptersFor(scope, translation);
  const s = summarize(chapters, days);
  const plan = buildPlan(chapters, days).slice(0, 3);
  const end = finishDate(new Date(), days).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const title = scopeTitle(scope);
  const set = (d: number) => setOnboarding({ days: Math.max(1, Math.min(730, d)) });

  return (
    <Quiz
      step={8}
      title="In how many days?"
      subtitle={`${title}, finished by ${end}.`}
      onContinue={() => router.push('/onboarding/apps')}
    >
      <View style={styles.chips}>
        {PRESETS.map((d) => (
          <Pressable key={d} onPress={() => set(d)} style={[styles.chip, days === d && styles.chipOn]}>
            <Text style={styles.chipText}>{label(d)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.custom}>
        <Text style={styles.customLabel}>Or pick your own</Text>
        <View style={styles.stepper}>
          <Pressable accessibilityLabel="Fewer days" hitSlop={8} onPress={() => set(days - 1)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>{'−'}</Text>
          </Pressable>
          <Text style={styles.stepValue}>{days} {days === 1 ? 'day' : 'days'}</Text>
          <Pressable accessibilityLabel="More days" hitSlop={8} onPress={() => set(days + 1)} style={styles.stepBtn}>
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.big}>{s.locksPerDay}</Text>
        <Text style={styles.bigLabel}>{s.locksPerDay === 1 ? 'reading' : 'readings'} a day, about 5 minutes each</Text>
      </View>
      {s.capped ? (
        <Text style={styles.warn}>
          That is a lot for one day. We keep it to {s.locksPerDay} readings a day, so we suggest at least {s.minDays} days.
        </Text>
      ) : null}

      <Text style={styles.heading}>Your first 3 days</Text>
      {plan.map((d) => (
        <View key={d.day} style={styles.card}>
          <Text style={styles.day}>Day {d.day}</Text>
          {d.readings.map((r, i) => (
            <Text key={i} style={styles.reading}>
              {r.label}
              <Text style={styles.min}>   {r.minutes} min</Text>
            </Text>
          ))}
        </View>
      ))}
      <Text style={styles.note}>If you fall behind, your plan recalculates from what is left. You can always change your deadline.</Text>
    </Quiz>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: radius.button, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.cardSelected, borderWidth: 0 },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  custom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  customLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.medium, fontSize: 22, lineHeight: 26, color: colors.text },
  stepValue: { minWidth: 84, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  summary: { marginTop: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  big: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 88, lineHeight: 88, color: colors.gold },
  bigLabel: { flex: 1, paddingBottom: 10, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.text },
  warn: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.gold },
  heading: { marginTop: 24, marginBottom: 10, fontFamily: fonts.display, includeFontPadding: false, fontSize: 30, lineHeight: 32, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 10 },
  day: { fontFamily: fonts.semibold, fontSize: 12, color: colors.gold, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  reading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 26, color: colors.text },
  min: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  note: { marginTop: 6, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
});
