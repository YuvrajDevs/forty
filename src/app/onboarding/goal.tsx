import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';
import { summarize } from '../../lib/plan';
import { chaptersFor, SCOPES } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

const DEADLINES = [14, 30, 60, 90, 180, 365];
const label = (d: number) => (d === 365 ? '1 year' : d >= 60 ? `${Math.round(d / 30)} months` : `${d} days`);

export default function Goal() {
  const { scope, days } = useOnboarding();
  const s = summarize(chaptersFor(scope), days);
  const hours = s.totalMinutes / 60;
  return (
    <Quiz step={7} title="What do you want to read, and by when?" onContinue={() => router.push('/onboarding/preview')}>
      {SCOPES.map((o) => (
        <Option
          key={o.id}
          label={o.title}
          hint={`${chaptersFor(o.id).length} chapters`}
          selected={scope === o.id}
          onPress={() => setOnboarding({ scope: o.id })}
        />
      ))}
      <Text style={styles.heading}>Finish in</Text>
      <View style={styles.chips}>
        {DEADLINES.map((d) => (
          <Pressable key={d} onPress={() => setOnboarding({ days: d })} style={[styles.chip, days === d && styles.chipOn]}>
            <Text style={styles.chipText}>{label(d)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.summary}>
        About {hours < 10 ? hours.toFixed(1) : Math.round(hours)} hours of reading in total. That is {s.locksPerDay}{' '}
        {s.locksPerDay === 1 ? 'reading' : 'readings'} a day.
      </Text>
      {s.capped ? (
        <Text style={styles.warn}>
          That is a lot for one day. We keep it to {s.locksPerDay} readings a day, so we suggest at least {s.minDays} days.
        </Text>
      ) : null}
    </Quiz>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: 12, marginBottom: 10, fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.button, borderWidth: 1.5, borderColor: '#EADFC2', backgroundColor: colors.card },
  chipOn: { borderColor: colors.gold, backgroundColor: '#FFFBEF' },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  summary: { marginTop: 20, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: colors.text },
  warn: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.gold },
});
