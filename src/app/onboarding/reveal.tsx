import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Quiz } from '../../components/Quiz';
import { useOnboarding } from '../../lib/onboarding';
import { summarize } from '../../lib/plan';
import { chaptersFor } from '../../lib/scopes';
import { colors, fonts } from '../../theme';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 280;
const STROKE = 34;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export default function Reveal() {
  const { phoneHours } = useOnboarding();
  const bibleHours = summarize(chaptersFor('bible'), 1).totalMinutes / 60;
  const yearHours = phoneHours * 365;
  const percent = (bibleHours / yearHours) * 100;
  const times = yearHours / bibleHours;
  // Keep the slice visible even when it is tiny.
  const sweep = Math.max(percent / 100, 0.012);

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress]);
  const offset = progress.interpolate({ inputRange: [0, 1], outputRange: [C, C * (1 - sweep)] });

  return (
    <Quiz step={5} title="Imagine what's possible" onContinue={() => router.push('/onboarding/frequency')}>
      <View style={styles.donutWrap} accessible accessibilityLabel={`The whole Bible is about ${percent.toFixed(1)} percent of your yearly phone time`}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#E7C766" strokeWidth={STROKE} fill="none" />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.green}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            fill="none"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={offset}
          />
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.pct}>{percent < 10 ? percent.toFixed(1) : fmt(percent)}%</Text>
          <Text style={styles.pctLabel}>of your phone time{'\n'}reads the whole Bible</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: '#E7C766' }]} />
          <Text style={styles.rowText}>
            <Text style={styles.strong}>{fmt(yearHours)} hours</Text> a year on your phone
          </Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: colors.green }]} />
          <Text style={styles.rowText}>
            <Text style={styles.strong}>{fmt(bibleHours)} hours</Text> to read the whole Bible
          </Text>
        </View>
      </View>

      <Text style={styles.body}>That leaves room to read it about {fmt(times)} times over.</Text>
      <Text style={styles.note}>Estimates, based on about 240 words a minute, the average adult silent reading speed for non-fiction.</Text>
    </Quiz>
  );
}

const styles = StyleSheet.create({
  donutWrap: { alignSelf: 'center', width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  pct: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 84, lineHeight: 88, color: colors.green },
  pctLabel: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, textAlign: 'center' },
  legend: { marginTop: 28, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  rowText: { fontFamily: fonts.body, fontSize: 16, color: colors.text },
  strong: { fontFamily: fonts.semibold },
  body: { marginTop: 18, fontFamily: fonts.medium, fontSize: 17, lineHeight: 26, color: colors.text },
  note: { marginTop: 8, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
});
