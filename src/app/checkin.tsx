import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Option, Quiz } from '../components/Quiz';
import { verseText } from '../lib/bible';
import { CONNECTION, FEELINGS, HELPLINES, looksLikeCrisis, pickVerse } from '../lib/checkin';
import { getOnboarding, setOnboarding, useOnboarding } from '../lib/onboarding';
import { iso } from '../lib/schedule';
import { colors, fonts, radius, spacing } from '../theme';

export default function CheckIn() {
  const { translation } = useOnboarding();
  const [step, setStep] = useState(0);
  const [connection, setConnection] = useState(0);
  const [feelings, setFeelings] = useState<string[]>([]);
  const [note, setNote] = useState('');

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

  if (step === 0)
    return (
      <Quiz compact title="How connected do you feel to God today?" ctaDisabled={!connection} onContinue={() => setStep(1)} secondary={notToday}>
        {CONNECTION.map((c, i) => (
          <Option key={c} label={c} selected={connection === i + 1} onPress={() => setConnection(i + 1)} />
        ))}
      </Quiz>
    );

  if (step === 1)
    return (
      <Quiz compact title="How are you feeling?" subtitle="Pick any that fit." onContinue={() => setStep(2)} secondary={notToday}>
        <View style={styles.chips}>
          {FEELINGS.map((f) => {
            const on = feelings.includes(f);
            return (
              <Pressable key={f} onPress={() => setFeelings(on ? feelings.filter((x) => x !== f) : [...feelings, f])} style={[styles.chip, on && styles.chipOn]}>
                <Text style={styles.chipText}>{f}</Text>
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

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: radius.button, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.cardSelected },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  input: { minHeight: 180, backgroundColor: colors.card, borderRadius: radius.card, padding: 18, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.text },
  verseCard: { backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 22 },
  verse: { fontFamily: fonts.scripture, fontSize: 20, lineHeight: 32, color: colors.text },
  ref: { marginTop: 12, fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, color: colors.gold },
  line: { marginTop: spacing.md, fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.text },
  disclaimer: { marginTop: spacing.md, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  crisis: { backgroundColor: '#FBE4E0', borderRadius: radius.card, padding: 18, marginBottom: spacing.md, gap: 6 },
  crisisTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, color: colors.text },
  crisisText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.text },
});
