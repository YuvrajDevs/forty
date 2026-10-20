import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { useOnboarding } from '../../lib/onboarding';
import { summarize } from '../../lib/plan';
import { chaptersFor } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const CELLS = Array.from({ length: 100 }, (_, i) => i);

export default function Reveal() {
  const { phoneHours } = useOnboarding();
  const bibleHours = summarize(chaptersFor('bible'), 1).totalMinutes / 60;
  const yearHours = phoneHours * 365;
  const percent = (bibleHours / yearHours) * 100;
  const times = yearHours / bibleHours;
  // Each square is 1% of a year of phone time; the green ones are the whole Bible.
  const green = Math.max(1, Math.round(percent));

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [progress]);

  return (
    <Quiz step={5} title="Imagine what's possible" onContinue={() => router.push('/onboarding/frequency')}>
      <View style={styles.stats}>
        <View style={[styles.stat, { backgroundColor: colors.cardSelected }]}>
          <Text style={styles.statNum}>{fmt(yearHours)}</Text>
          <Text style={styles.statLabel}>hours a year on your phone</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: '#E3EBDD' }]}>
          <Text style={[styles.statNum, { color: colors.green }]}>{fmt(bibleHours)}</Text>
          <Text style={styles.statLabel}>hours to read the whole Bible</Text>
        </View>
      </View>

      <View style={styles.grid} accessible accessibilityLabel={`The whole Bible is about ${percent.toFixed(1)} percent of your yearly phone time`}>
        {CELLS.map((i) => {
          const isBible = i < green;
          const start = (i / 100) * 0.75;
          return (
            <Animated.View
              key={i}
              style={[
                styles.cell,
                { backgroundColor: isBible ? colors.green : '#E7C766' },
                { opacity: progress.interpolate({ inputRange: [start, Math.min(1, start + 0.25)], outputRange: [0, isBible ? 1 : 0.85], extrapolate: 'clamp' }) },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: '#E7C766' }]} />
        <Text style={styles.legendText}>Your phone time</Text>
        <View style={[styles.dot, { backgroundColor: colors.green, marginLeft: 16 }]} />
        <Text style={styles.legendText}>The whole Bible</Text>
      </View>

      <Text style={styles.body}>
        That's just {percent < 10 ? percent.toFixed(1) : fmt(percent)}% of your phone time, with room to read it about {fmt(times)} times over.
      </Text>
      <Text style={styles.note}>Estimates, based on about 240 words a minute, the average adult silent reading speed for non-fiction.</Text>
    </Quiz>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: radius.card, padding: 16 },
  statNum: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 52, lineHeight: 54, color: colors.gold },
  statLabel: { marginTop: 4, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24 },
  cell: { width: '9%', aspectRatio: 1, margin: '0.5%', borderRadius: 4 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  body: { marginTop: 20, fontFamily: fonts.medium, fontSize: 17, lineHeight: 26, color: colors.text },
  note: { marginTop: 8, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
});
