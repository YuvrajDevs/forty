import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { useOnboarding } from '../../lib/onboarding';
import { summarize } from '../../lib/plan';
import { chaptersFor } from '../../lib/scopes';
import { colors, fonts, radius } from '../../theme';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export default function Reveal() {
  const { phoneHours } = useOnboarding();
  const bibleHours = summarize(chaptersFor('bible'), 1).totalMinutes / 60;
  const yearHours = phoneHours * 365;
  const fullDays = yearHours / 24;
  const percent = (bibleHours / yearHours) * 100;
  const times = yearHours / bibleHours;

  const phoneBar = useRef(new Animated.Value(0)).current;
  const bibleBar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(phoneBar, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(bibleBar, { toValue: 1, duration: 900, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [phoneBar, bibleBar]);

  const biblePct = Math.max(2, Math.min(100, percent));
  const wide = (v: Animated.Value, to: number) => v.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${to}%`] });

  return (
    <Quiz step={5} title="Imagine what's possible" onContinue={() => router.push('/onboarding/frequency')}>
      <Text style={styles.big}>
        {phoneHours} {phoneHours === 1 ? 'hour' : 'hours'} a day is about {fmt(yearHours)} hours a year, or {fmt(fullDays)} full days on your phone.
      </Text>
      <View style={styles.bars}>
        <Text style={styles.barLabel}>Phone time</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { backgroundColor: colors.gold, width: wide(phoneBar, 100) }]} />
        </View>
        <Text style={[styles.barLabel, { marginTop: 16 }]}>The whole Bible</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { backgroundColor: colors.green, width: wide(bibleBar, biblePct) }]} />
        </View>
      </View>
      <Text style={styles.body}>
        The whole Bible takes about {fmt(bibleHours)} hours to read. Just {percent < 10 ? percent.toFixed(1) : fmt(percent)}% of your
        phone time would get you through it, with room to read it about {fmt(times)} times over.
      </Text>
      <Text style={styles.note}>These are estimates, based on about 240 words a minute.</Text>
    </Quiz>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: fonts.displayRegular, fontSize: 20, lineHeight: 30, color: colors.text },
  bars: { marginVertical: 28 },
  barLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  track: { height: 28, borderRadius: radius.button, backgroundColor: '#EFE6CC', overflow: 'hidden' },
  bar: { height: 28, borderRadius: radius.button },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: colors.text },
  note: { marginTop: 12, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
