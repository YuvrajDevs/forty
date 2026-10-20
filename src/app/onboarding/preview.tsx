import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { useOnboarding } from '../../lib/onboarding';
import { buildPlan, finishDate, summarize } from '../../lib/plan';
import { chaptersFor, SCOPES } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

export default function Preview() {
  const { scope, days } = useOnboarding();
  const chapters = chaptersFor(scope);
  const s = summarize(chapters, days);
  const plan = buildPlan(chapters, days).slice(0, 3);
  const end = finishDate(new Date(), days).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const title = SCOPES.find((x) => x.id === scope)?.title ?? '';
  return (
    <Quiz step={8} title={`${s.locksPerDay} ${s.locksPerDay === 1 ? 'reading' : 'readings'} a day. Finish by ${end}.`} subtitle={title} onContinue={() => router.replace('/')} cta="Looks good">
      {plan.map((d) => (
        <View key={d.day} style={styles.card}>
          <Text style={styles.day}>Day {d.day}</Text>
          {d.readings.map((r, i) => (
            <Text key={i} style={styles.reading}>
              {r.label} <Text style={styles.min}>  about {r.minutes} min</Text>
            </Text>
          ))}
        </View>
      ))}
      <Text style={styles.note}>
        If you fall behind, your plan recalculates from what is left. You can always extend your deadline.
      </Text>
    </Quiz>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#EADFC2' },
  day: { fontFamily: fonts.semibold, fontSize: 12, color: colors.gold, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  reading: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 26, color: colors.text },
  min: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  note: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
});
