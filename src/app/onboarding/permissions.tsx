import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { native } from '../../lib/lock';
import { fonts, radius, useColors, useStyles } from '../../theme';
import type { Palette } from '../../theme';

type Status = { acc: boolean; overlay: boolean; battery: boolean };

const ITEMS: { key: keyof Status; title: string; why: string; open: () => void }[] = [
  { key: 'acc', title: 'Accessibility', why: 'Lets FortyBible notice when a chosen app opens so it can ask you to read first. It never reads your screen.', open: () => native?.openAccessibilitySettings() },
  { key: 'overlay', title: 'Display over other apps', why: 'Lets the reading prompt open on top of a locked app.', open: () => native?.openOverlaySettings() },
  { key: 'battery', title: 'Run in background', why: 'Stops your phone from closing FortyBible, so the lock keeps working.', open: () => native?.openBatterySettings() },
];

export default function Permissions() {
  const styles = useStyles(createStyles);
  const [status, setStatus] = useState<Status>({ acc: false, overlay: false, battery: false });

  const refresh = useCallback(() => {
    if (!native) return;
    try {
      setStatus({ acc: native.isAccessibilityEnabled(), overlay: native.canDrawOverlays(), battery: native.isBatteryUnrestricted() });
    } catch {
      // keep what we had
    }
  }, []);

  // Coming back from Android settings, check again.
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  const allow = (open: () => void) => {
    if (!native) return Alert.alert('Available in the installed app', 'This permission can only be turned on in the installed FortyBible app, not in Expo Go.');
    open();
  };

  return (
    <Quiz
      compact
      step={12}
      title="Three quick permissions"
      subtitle="Android needs your OK for the lock to work. You can turn each off any time."
      onContinue={() => router.push('/onboarding/notifications')}
      cta="Continue"
    >
      {ITEMS.map((p, i) => {
        const on = status[p.key];
        return (
          <View key={p.key} style={styles.card}>
            <Text style={styles.num}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.head}>
                <Text style={styles.name}>{p.title}</Text>
                {on ? (
                  <Text style={styles.allowed}>Allowed {'✓'}</Text>
                ) : (
                  <Pressable accessibilityRole="button" onPress={() => allow(p.open)} style={styles.allow}>
                    <Text style={styles.allowText}>Allow</Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.why}>{p.why}</Text>
            </View>
          </View>
        );
      })}
    </Quiz>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, backgroundColor: colors.card, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 10 },
  num: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 32, lineHeight: 34, color: colors.gold },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  why: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  allow: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 14 },
  allowText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.onPrimary },
  allowed: { fontFamily: fonts.semibold, fontSize: 13, color: colors.green },
});
