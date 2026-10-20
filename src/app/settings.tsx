import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TRANSLATIONS } from '../lib/bible';
import { requestNotificationPermission } from '../lib/notifications';
import { deleteAllData, getOnboarding, resetOnboarding, setOnboarding, useOnboarding } from '../lib/onboarding';
import { colors, fonts, radius, spacing } from '../theme';

export default function Settings() {
  const s = useOnboarding();

  const toggleReminders = async (on: boolean) => {
    if (!on) return setOnboarding({ remindersOn: false });
    const ok = await requestNotificationPermission();
    if (ok) setOnboarding({ remindersOn: true });
    else Alert.alert('Notifications are off', 'Turn on notifications for FortyBible in your phone settings to get reminders.');
  };

  const exportData = () => Share.share({ title: 'FortyBible data', message: JSON.stringify(getOnboarding(), null, 2) });

  const wipe = () =>
    Alert.alert('Delete everything?', 'This removes your plan, reading history, streak and journal from this phone. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAllData();
          router.replace('/');
        },
      },
    ]);

  const restart = () =>
    Alert.alert('Restart onboarding?', 'You will go through the questions again. Your reading history is kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        onPress: () => {
          const keep = { readChapters: getOnboarding().readChapters, checkins: getOnboarding().checkins };
          resetOnboarding();
          setOnboarding(keep);
          router.replace('/');
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.section}>Bible translation</Text>
        {TRANSLATIONS.map((t) => {
          const on = s.translation === t.id;
          return (
            <Pressable key={t.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setOnboarding({ translation: t.id })} style={[styles.card, on && styles.cardOn]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t.name}</Text>
                <Text style={styles.cardHint}>{t.note}</Text>
              </View>
              <View style={[styles.radio, on && styles.radioOn]} />
            </Pressable>
          );
        })}
        <Text style={styles.hint}>All three work offline. Your plan keeps its chapters; the Psalms and a few books are numbered differently in the Douay-Rheims.</Text>

        <Text style={styles.section}>Lock</Text>
        <Row icon="apps-outline" label="Locked apps" value={`${s.lockedApps.length} chosen`} onPress={() => router.push('/settings-apps')} />
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Lock reminder</Text>
            <Text style={styles.cardHint}>A nudge when your apps lock each day</Text>
          </View>
          <Switch value={s.remindersOn} onValueChange={toggleReminders} trackColor={{ true: colors.gold, false: colors.border }} thumbColor="#FFFFFF" />
        </View>
        <Row icon="information-circle-outline" label="How the lock works" onPress={() => router.push('/legal?doc=lock')} />

        <Text style={styles.section}>Subscription</Text>
        <Row icon="card-outline" label="Manage subscription" onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions')} />

        <Text style={styles.section}>Your data</Text>
        <Row icon="share-outline" label="Export my data" onPress={exportData} />
        <Row icon="refresh-outline" label="Restart onboarding" onPress={restart} />
        <Row icon="trash-outline" label="Delete everything" danger onPress={wipe} />

        <Text style={styles.section}>About</Text>
        <Row icon="document-text-outline" label="Privacy policy" onPress={() => router.push('/legal?doc=privacy')} />
        <Row icon="reader-outline" label="Terms of use" onPress={() => router.push('/legal?doc=terms')} />
        <Text style={styles.version}>FortyBible {Constants.expoConfig?.version ?? ''}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={22} color={danger ? '#B3261E' : colors.text} />
      <Text style={[styles.rowLabel, { flex: 1 }, danger && { color: '#B3261E' }]}>{label}</Text>
      {value ? <Text style={styles.cardHint}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 48, justifyContent: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 56, lineHeight: 58, color: colors.text },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm, fontFamily: fonts.display, includeFontPadding: false, fontSize: 28, lineHeight: 30, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: 16, marginBottom: 10 },
  cardOn: { backgroundColor: colors.cardSelected },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  cardHint: { marginTop: 1, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#BDB398' },
  radioOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: radius.card, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 10 },
  rowLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  version: { marginTop: spacing.md, textAlign: 'center', fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
