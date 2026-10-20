import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { useOnboarding } from '../../lib/onboarding';
import { buildPlan } from '../../lib/plan';
import { chaptersFor, SCOPES } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

export default function Journey() {
  const { scope, days } = useOnboarding();
  const plan = buildPlan(chaptersFor(scope), days);
  const chaptersBy = (d: number) =>
    plan.slice(0, d).reduce((n, day) => n + day.readings.reduce((m, r) => m + r.chapters.length, 0), 0);
  const name = SCOPES.find((s) => s.id === scope)?.title ?? 'the Bible';
  const plural = (n: number) => `${n} ${n === 1 ? 'chapter' : 'chapters'}`;

  const steps = [
    { day: 'Day 1', text: 'Your plan starts. You finish your first reading and your first unlock.' },
    { day: 'Day 3', text: `Your first streak. You'll have read ${plural(chaptersBy(3))}.` },
    { day: 'Day 5', text: "We remind you that your free trial ends in 2 days." },
    { day: 'Day 7', text: `About ${plural(chaptersBy(7))} of ${name} read, and a 7-day habit built. Billing starts only if you keep going. Cancel any time in Google Play.` },
  ];

  return (
    <Quiz title="Your first 7 days" onContinue={() => router.push('/onboarding/why-it-works')}>
      {steps.map((s, i) => (
        <View key={s.day} style={styles.row}>
          <View style={styles.rail}>
            <View style={styles.dot} />
            {i < steps.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.card}>
            <Text style={styles.day}>{s.day}</Text>
            <Text style={styles.text}>{s.text}</Text>
          </View>
        </View>
      ))}
    </Quiz>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.gold, marginTop: 22 },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 12 },
  day: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 26, lineHeight: 28, color: colors.gold },
  text: { marginTop: 4, fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
});
