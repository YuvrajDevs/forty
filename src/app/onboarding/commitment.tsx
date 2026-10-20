import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../../theme';

const HOLD_MS = 1800;

export default function Commitment() {
  const progress = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  const start = () => {
    Animated.timing(progress, { toValue: 1, duration: HOLD_MS, easing: Easing.linear, useNativeDriver: false }).start(({ finished }) => {
      if (!finished) return;
      setDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => router.push('/onboarding/permissions'), 500);
    });
  };
  const stop = () => {
    if (done) return;
    progress.stopAnimation();
    Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>FORTY  {'·'}  10 OF 12</Text>
        <Text style={styles.title}>Ready to put God first?</Text>
        <Text style={styles.subtitle}>Small, daily reading beats occasional long sessions. Press and hold to make it a promise to yourself.</Text>
      </View>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" accessibilityLabel="Press and hold to commit" onPressIn={start} onPressOut={stop} style={styles.hold}>
          <Animated.View style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          <Text style={styles.holdText}>{done ? 'Committed' : "I'm ready to put God first"}</Text>
        </Pressable>
        <Text style={styles.hint}>Hold the button</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, fontSize: 64, lineHeight: 64, letterSpacing: 0.5, color: colors.text },
  subtitle: { marginTop: spacing.md, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  footer: { padding: spacing.lg, alignItems: 'center' },
  hold: { alignSelf: 'stretch', height: 62, borderRadius: 31, backgroundColor: colors.card, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.primary },
  holdText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text, textAlign: 'center', includeFontPadding: false },
  hint: { marginTop: 12, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
