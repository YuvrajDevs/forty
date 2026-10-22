import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Quiz } from '../components/Quiz';
import { verseText } from '../lib/bible';
import { CONNECTION, FEELINGS, HELPLINES, looksLikeCrisis, pickVerse } from '../lib/checkin';
import { getOnboarding, setOnboarding, useOnboarding } from '../lib/onboarding';
import { iso } from '../lib/schedule';
import { fonts, radius, spacing, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

export default function CheckIn() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { translation } = useOnboarding();
  const tile = Math.floor((useWindowDimensions().width - 48 - 24) / 3);
  const [step, setStep] = useState(0);
  const [connection, setConnection] = useState(0);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    Grateful: 'heart-outline', Peaceful: 'leaf-outline', Anxious: 'pulse-outline', Tired: 'moon-outline', Struggling: 'cloudy-outline',
    Joyful: 'sunny-outline', Guilty: 'sad-outline', Lonely: 'person-outline', Hopeful: 'sparkles-outline',
  };
  const pick = pickVerse(connection || 3, feelings);
  const text = verseText(translation, pick.ref.bookId, pick.ref.chapter, pick.ref.verse);
  const crisis = looksLikeCrisis(note);

  const save = () => {
    const date = iso(new Date());
    const entry = { date, connection, feelings, note: note.trim(), verse: pick.ref.label };
    setOnboarding({ checkins: [...getOnboarding().checkins.filter((c) => c.date !== date), entry] });
    router.back();
  };
  const notToday = { label: 'Not today', onPress: () => router.back() };

  if (step === 0) {
    const level = connection || 3;
    const size = 84 + level * 22;
    return (
      <Quiz compact title="How close do you feel to God today?" ctaDisabled={!connection} onContinue={() => setStep(1)} secondary={notToday}>
        <View style={styles.dial}>
          <View style={styles.sunStage}>
            <View style={[styles.sunGlow, { width: size + 60, height: size + 60, borderRadius: (size + 60) / 2, opacity: connection ? 0.35 : 0.12 }]} />
            <View style={[styles.sun, { width: size, height: size, borderRadius: size / 2, opacity: connection ? 1 : 0.5 }]}>
              <Ionicons name="sunny" size={size * 0.5} color={colors.onPrimary} />
            </View>
          </View>
          <Text style={styles.dialWord}>{connection ? CONNECTION[connection - 1] : 'Tap below'}</Text>
          <View style={styles.steps}>
            {CONNECTION.map((c, i) => (
              <Pressable key={c} accessibilityRole="radio" accessibilityLabel={c} accessibilityState={{ selected: connection === i + 1 }} onPress={() => { Haptics.selectionAsync().catch(() => {}); setConnection(i + 1); }} style={styles.stepHit}>
                <View style={[styles.stepBar, i < connection && styles.stepBarOn]} />
              </Pressable>
            ))}
          </View>
          <View style={styles.ends}>
            <Text style={styles.endText}>Distant</Text>
            <Text style={styles.endText}>Very close</Text>
          </View>
        </View>
      </Quiz>
    );
  }

  if (step === 1)
    return (
      <Quiz compact title="How are you feeling?" subtitle="Pick any that fit." onContinue={() => setStep(2)} secondary={notToday}>
        <View style={styles.grid}>
          {FEELINGS.map((f) => {
            const on = feelings.includes(f);
            return (
              <Pressable key={f} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setFeelings(on ? feelings.filter((x) => x !== f) : [...feelings, f])} style={[styles.tile, { width: tile, height: tile }, on && styles.tileOn]}>
                <Ionicons name={ICONS[f] ?? 'ellipse-outline'} size={28} color={on ? colors.gold : colors.textSecondary} />
                <Text style={styles.tileText}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </Quiz>
    );

  if (step === 2)
    return (
      <Quiz compact title="Anything on your heart?" subtitle="A prayer, a worry, or a thank-you. Only you can see this." onContinue={() => setStep(3)} cta={note.trim() ? 'Continue' : 'Skip the note'} secondary={notToday}>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Write here"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          textAlignVertical="top"
        />
      </Quiz>
    );

  return (
    <Quiz compact title="A word for today" onContinue={save} cta="Done">
      {crisis ? (
        <View style={styles.crisis}>
          <Text style={styles.crisisTitle}>You matter, and you don't have to face this alone.</Text>
          <Text style={styles.crisisText}>Please reach out to someone you trust today, like a friend, family member or pastor. If you want to talk to someone right now:</Text>
          {HELPLINES.map((h) => (
            <Text key={h.place} style={styles.crisisText}>
              <Text style={{ fontFamily: fonts.semibold }}>{h.place}: </Text>
              {h.text}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.verseCard}>
        <Text style={styles.verse}>{text}</Text>
        <Text style={styles.ref}>{pick.ref.label}</Text>
      </View>
      <Text style={styles.line}>{pick.line}</Text>
      <Text style={styles.disclaimer}>FortyBible is not counselling and does not replace a pastor or professional care.</Text>
    </Quiz>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  dial: { alignItems: 'center', paddingTop: spacing.md },
  sunStage: { height: 230, alignItems: 'center', justifyContent: 'center' },
  sunGlow: { position: 'absolute', backgroundColor: colors.primary },
  sun: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dialWord: { marginTop: spacing.sm, fontFamily: fonts.display, fontSize: 40, color: colors.text, includeFontPadding: false },
  steps: { flexDirection: 'row', gap: 8, marginTop: spacing.lg, width: '100%' },
  stepHit: { flex: 1, paddingVertical: 14 },
  stepBar: { height: 10, borderRadius: 5, backgroundColor: colors.card },
  stepBarOn: { backgroundColor: colors.primary },
  ends: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  endText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { borderRadius: radius.card, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent' },
  tileOn: { backgroundColor: colors.cardSelected, borderColor: colors.primary },
  tileText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  input: { minHeight: 180, backgroundColor: colors.card, borderRadius: radius.card, padding: 18, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.text },
  verseCard: { backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 22 },
  verse: { fontFamily: fonts.scripture, fontSize: 20, lineHeight: 32, color: colors.text },
  ref: { marginTop: 12, fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, color: colors.gold },
  line: { marginTop: spacing.md, fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.text },
  disclaimer: { marginTop: spacing.md, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  crisis: { backgroundColor: colors.dangerBg, borderRadius: radius.card, padding: 18, marginBottom: spacing.md, gap: 6 },
  crisisTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.text },
  crisisText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.text },
});
