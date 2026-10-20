import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppTile';
import { Button } from '../components/Button';
import { LOCKABLE_APPS } from '../lib/apps';
import { emergencyUnlock, goHome, openApp } from '../lib/lock';
import { useOnboarding } from '../lib/onboarding';
import { useApps } from '../lib/useApps';
import { ensureDayPlan, getToday, skipToday } from '../lib/progress';
import { colors, fonts, radius, spacing } from '../theme';

// Opened by the Android lock service when a chosen app comes to the front.
export default function Lock() {
  const { pkg = '' } = useLocalSearchParams<{ pkg?: string }>();
  const s = useOnboarding();
  const t = getToday(s);
  const pending = t.active ? t.readings.length - t.doneCount : 0;
  const next = t.nextIndex >= 0 ? t.readings[t.nextIndex] : undefined;
  const info = useApps().find((a) => a.id === pkg);
  const name = info?.name ?? LOCKABLE_APPS.find((a) => a.id === pkg)?.name ?? 'This app';

  useEffect(() => {
    ensureDayPlan();
  }, []);

  // Nothing due (all read, rest day or skipped): let them straight through.
  useEffect(() => {
    if (pending <= 0) {
      if (pkg) openApp(pkg);
      router.replace('/today');
    }
  }, [pending, pkg]);

  // Back should not reveal the locked app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, []);

  if (pending <= 0 || !next) return <View style={styles.safe} />;

  const leave = (action: () => void) => {
    action();
    if (pkg) openApp(pkg);
    router.replace('/today');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <AppIcon id={pkg} icon={info?.icon} name={name} size={72} />
        <Text style={styles.eyebrow}>{name.toUpperCase()} IS LOCKED</Text>
        <Text style={styles.title}>Read first.</Text>
        <View style={styles.card}>
          <Text style={styles.count}>Reading {t.doneCount + 1} of {t.readings.length}</Text>
          <Text style={styles.label}>{next.label}</Text>
          <Text style={styles.min}>about {next.minutes} min</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button label="Start reading" onPress={() => router.replace(`/reader?mode=plan&lock=${encodeURIComponent(pkg)}`)} />
        <Button variant="soft" label="Emergency access (15 min)" onPress={() => leave(() => emergencyUnlock(15))} />
        <View style={styles.links}>
          <Pressable onPress={() => leave(() => skipToday(true))}><Text style={styles.link}>Skip today</Text></Pressable>
          <Pressable onPress={goHome}><Text style={styles.link}>Not now</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  eyebrow: { marginTop: spacing.lg, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: 6, fontFamily: fonts.display, includeFontPadding: false, fontSize: 72, lineHeight: 72, color: colors.text },
  card: { marginTop: spacing.lg, alignSelf: 'stretch', alignItems: 'center', backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 22 },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.gold },
  label: { marginTop: 4, fontFamily: fonts.display, includeFontPadding: false, fontSize: 40, lineHeight: 42, color: colors.text, textAlign: 'center' },
  min: { marginTop: 2, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  footer: { padding: spacing.lg, gap: 10 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 28, paddingTop: 4 },
  link: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textDecorationLine: 'underline' },
});
