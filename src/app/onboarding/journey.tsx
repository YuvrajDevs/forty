import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { useOnboarding } from '../../lib/onboarding';
import { buildPlan } from '../../lib/plan';
import { chaptersFor, SCOPES } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

const MILESTONES = [
  'Your plan starts',
  'Your second unlock',
  'Your first streak',
  'Halfway through your trial',
  'We remind you your trial ends in 2 days',
  'One more day to go',
];

export default function Journey() {
  const { scope, days } = useOnboarding();
  const plan = buildPlan(chaptersFor(scope), days);
  const name = SCOPES.find((s) => s.id === scope)?.title ?? 'the Bible';
  const chaptersBy = (d: number) =>
    plan.slice(0, d).reduce((n, day) => n + day.readings.reduce((m, r) => m + r.chapters.length, 0), 0);
  const plural = (n: number) => `${n} ${n === 1 ? 'chapter' : 'chapters'}`;
  const dayText = (d: number) => {
    const rs = plan[d - 1]?.readings ?? [];
    const mins = rs.reduce((n, r) => n + r.minutes, 0);
    return rs.length ? `${rs.map((r) => r.label).join(', ')} \u00B7 about ${mins} min` : 'Rest day';
  };

  return (
    <Quiz title="Your first 7 days" subtitle="Here is how your free week could go." onContinue={() => router.push('/onboarding/why-it-works')}>
      {MILESTONES.map((m, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.rail}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{i + 1}</Text>
            </View>
            <View style={styles.line} />
          </View>
          <View style={styles.item}>
            <Text style={styles.milestone}>{m}</Text>
            <Text style={styles.readings} numberOfLines={2}>{dayText(i + 1)}</Text>
          </View>
        </View>
      ))}

      <View style={styles.row}>
        <View style={styles.rail}>
          <View style={[styles.badge, styles.badgeFinal]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>7</Text>
          </View>
        </View>
        <View style={styles.final}>
          <View style={styles.sunDisc} />
          <Text style={styles.finalEyebrow}>DAY 7</Text>
          <Text style={styles.finalTitle}>A habit, built.</Text>
          <Text style={styles.finalBody}>
            About {plural(chaptersBy(7))} of {name} read, and seven days of putting God first.
          </Text>
          <Text style={styles.finalFine}>Billing starts only if you keep going. Cancel any time in Google Play.</Text>
        </View>
      </View>
    </Quiz>
  );
}

const BADGE = 34;
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: BADGE },
  badge: { width: BADGE, height: BADGE, borderRadius: BADGE / 2, backgroundColor: colors.cardSelected, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  badgeFinal: { backgroundColor: colors.primary, borderColor: colors.primary },
  badgeText: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18, color: colors.gold, includeFontPadding: false },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  item: { flex: 1, paddingBottom: 18, paddingTop: 3 },
  milestone: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.text },
  readings: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  final: { flex: 1, backgroundColor: colors.primary, borderRadius: radius.card, padding: 20, overflow: 'hidden', marginBottom: 8 },
  sunDisc: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: '#FBE08A' },
  finalEyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.text },
  finalTitle: { marginTop: 4, fontFamily: fonts.display, includeFontPadding: false, fontSize: 46, lineHeight: 48, color: colors.text },
  finalBody: { marginTop: 6, fontFamily: fonts.medium, fontSize: 16, lineHeight: 23, color: colors.text },
  finalFine: { marginTop: 10, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: '#4A3F1A' },
});
