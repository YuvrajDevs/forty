import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTile } from '../components/AppTile';
import { useApps } from '../lib/useApps';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import { colors, fonts, spacing } from '../theme';

export default function SettingsApps() {
  const { lockedApps } = useOnboarding();
  const apps = useApps();
  const toggle = (id: string) =>
    setOnboarding({ lockedApps: lockedApps.includes(id) ? lockedApps.filter((a) => a !== id) : [...lockedApps, id] });
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Locked apps</Text>
        <Text style={styles.sub}>These stay locked until you read. Calls, messages, maps and emergency apps are never blocked.</Text>
        <View style={styles.grid}>
          {apps.map((a) => (
            <AppTile key={a.id} id={a.id} name={a.name} icon={a.icon} selected={lockedApps.includes(a.id)} onPress={() => toggle(a.id)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 48, justifyContent: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 52, lineHeight: 54, color: colors.text },
  sub: { marginTop: 6, marginBottom: spacing.lg, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
