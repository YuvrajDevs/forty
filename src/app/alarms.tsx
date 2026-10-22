import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addAlarm, MAX_ALARMS, removeAlarm, updateAlarm } from '../lib/alarms';
import { native } from '../lib/lock';
import { requestNotificationPermission } from '../lib/notifications';
import { formatTime } from '../lib/lockTimes';
import { useOnboarding } from '../lib/onboarding';
import type { VerseAlarm } from '../lib/onboarding';
import { fonts, radius, spacing, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Alarms() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { alarms } = useOnboarding();

  const turnOn = (a: VerseAlarm, on: boolean) => {
    updateAlarm(a.id, { on });
    if (on) requestNotificationPermission().catch(() => {});
    // Android 14+ can switch off full-screen alerts; ask the person to allow them once.
    if (on && native && !native.canUseFullScreen()) {
      Alert.alert('Show over the lock screen?', 'Allow full-screen alerts so your verse can appear when the phone is locked.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open settings', onPress: () => native?.openFullScreenSettings() },
      ]);
    }
  };

  const confirmDelete = (a: VerseAlarm) =>
    Alert.alert('Delete this alarm?', formatTime(a.minutes), [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAlarm(a.id) },
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Verse alarms</Text>
        <Text style={styles.sub}>Wake up or pause your day with a verse. It appears on a full screen and can be read aloud.</Text>
        {!native ? <Text style={styles.note}>Alarms ring in the installed Android app, not in preview.</Text> : null}

        {alarms.map((a) => (
          <View key={a.id} style={[styles.card, !a.on && { opacity: 0.6 }]}>
            <View style={styles.head}>
              <Text style={styles.time}>{formatTime(a.minutes)}</Text>
              <Switch accessibilityLabel="Alarm on" value={a.on} onValueChange={(v) => turnOn(a, v)} trackColor={{ true: colors.accent, false: colors.border }} thumbColor={colors.dark ? colors.text : '#FFFFFF'} />
            </View>
            <View style={styles.steppers}>
              <Stepper label="Hour" value={String(Math.floor(a.minutes / 60) % 12 === 0 ? 12 : Math.floor(a.minutes / 60) % 12) + (a.minutes < 720 ? ' AM' : ' PM')} onMinus={() => updateAlarm(a.id, { minutes: (a.minutes - 60 + 1440) % 1440 })} onPlus={() => updateAlarm(a.id, { minutes: (a.minutes + 60) % 1440 })} />
              <Stepper label="Minute" value={String(a.minutes % 60).padStart(2, '0')} onMinus={() => updateAlarm(a.id, { minutes: a.minutes - (a.minutes % 60 === 0 ? -55 : 5) })} onPlus={() => updateAlarm(a.id, { minutes: a.minutes + (a.minutes % 60 === 55 ? -55 : 5) })} />
            </View>
            <View style={styles.days}>
              {DAY_LETTERS.map((l, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="checkbox"
                  accessibilityLabel={DAY_NAMES[i]}
                  accessibilityState={{ checked: a.days[i] }}
                  onPress={() => {
                    const days = a.days.map((v, j) => (j === i ? !v : v));
                    if (!days.some(Boolean)) return Alert.alert('Keep at least one day', 'Turn the alarm off instead, or delete it.');
                    updateAlarm(a.id, { days });
                  }}
                  style={[styles.day, a.days[i] && styles.dayOn]}
                >
                  <Text style={[styles.dayText, a.days[i] && styles.dayTextOn]}>{l}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.opts}>
              <Option icon="volume-high-outline" label="Read the verse aloud" value={a.speak} onChange={(v) => updateAlarm(a.id, { speak: v })} />
              <Option icon="musical-notes-outline" label="Play a sound" value={a.sound} onChange={(v) => updateAlarm(a.id, { sound: v })} />
            </View>
            <Pressable accessibilityRole="button" onPress={() => confirmDelete(a)} hitSlop={8} style={styles.delete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))}

        {alarms.length === 0 ? <Text style={styles.empty}>No alarms yet.</Text> : null}

        {alarms.length < MAX_ALARMS ? (
          <Pressable accessibilityRole="button" onPress={() => { addAlarm(); requestNotificationPermission().catch(() => {}); }} style={styles.add}>
            <Text style={styles.addText}>Add an alarm</Text>
          </Pressable>
        ) : (
          <Text style={styles.sub}>That is the most you can set ({MAX_ALARMS}).</Text>
        )}
        <Text style={styles.fine}>Alarms use your phone's alarm clock, so they ring even when FortyBible is closed. Snooze gives you 10 more minutes.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  const styles = useStyles(createStyles);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable accessibilityLabel={`Decrease ${label}`} hitSlop={8} onPress={onMinus} style={styles.stepBtn}><Text style={styles.stepBtnText}>{'−'}</Text></Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable accessibilityLabel={`Increase ${label}`} hitSlop={8} onPress={onPlus} style={styles.stepBtn}><Text style={styles.stepBtnText}>+</Text></Pressable>
      </View>
    </View>
  );
}

function Option({ icon, label, value, onChange }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: boolean; onChange: (v: boolean) => void }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.opt}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <Text style={styles.optLabel}>{label}</Text>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: colors.accent, false: colors.border }} thumbColor={colors.dark ? colors.text : '#FFFFFF'} />
    </View>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 48, justifyContent: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 52, lineHeight: 54, color: colors.text },
  sub: { marginTop: 6, marginBottom: spacing.lg, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  note: { marginBottom: spacing.md, padding: 14, borderRadius: radius.card, backgroundColor: colors.card, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 14 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 44, color: colors.text },
  steppers: { flexDirection: 'row', gap: 12, marginTop: 10 },
  stepLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: radius.button, padding: 4 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 24, color: colors.onPrimary },
  stepValue: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  day: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.primary },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  dayTextOn: { color: colors.onPrimary },
  opts: { marginTop: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  optLabel: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text },
  delete: { alignSelf: 'flex-start', marginTop: 8 },
  deleteText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger },
  empty: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginBottom: spacing.md },
  add: { height: 56, borderRadius: radius.button, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.onPrimary },
  fine: { marginTop: spacing.lg, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
});
