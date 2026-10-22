import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { parseVerseKey, refLabel, verseText } from '../lib/bible';
import { dueCards, review } from '../lib/memory';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import { iso } from '../lib/schedule';
import { colors, fonts, radius, spacing } from '../theme';

/** Flashcards for the verses you chose to memorize. */
export default function Memory() {
  const s = useOnboarding();
  const today = iso(new Date());
  // The queue is fixed when the screen opens, so cards that come back later today do not loop.
  const queue = useMemo(() => dueCards(s.memory, today).map((c) => c.key), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);

  const key = queue[i];
  const answer = (gotIt: boolean) => {
    setOnboarding({ memory: review(s.memory, key, gotIt, today) });
    setShown(false);
    setI(i + 1);
  };

  const { bookId, chapter, verse } = key ? parseVerseKey(key) : { bookId: '', chapter: 0, verse: 0 };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Close" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        {key ? <Text style={styles.count}>{i + 1} of {queue.length}</Text> : null}
      </View>

      {key ? (
        <>
          <Pressable onPress={() => setShown(true)} style={styles.cardWrap} accessibilityRole="button" accessibilityLabel={shown ? 'Verse' : 'Show the verse'}>
            <View style={[styles.card, shown && styles.cardOpen]}>
              <Text style={styles.ref}>{refLabel(s.translation, bookId, chapter, verse)}</Text>
              {shown ? (
                <Text style={styles.verse}>{verseText(s.translation, bookId, chapter, verse)}</Text>
              ) : (
                <Text style={styles.hint}>Say it from memory, then tap to check.</Text>
              )}
            </View>
          </Pressable>
          <View style={styles.footer}>
            {shown ? (
              <View style={styles.row}>
                <View style={{ flex: 1 }}><Button variant="soft" label="Again" onPress={() => answer(false)} /></View>
                <View style={{ flex: 1 }}><Button label="Got it" onPress={() => answer(true)} /></View>
              </View>
            ) : (
              <Button label="Show the verse" onPress={() => setShown(true)} />
            )}
          </View>
        </>
      ) : (
        <View style={styles.done}>
          <Text style={styles.doneTitle}>{queue.length ? 'Well done.' : 'Nothing to review.'}</Text>
          <Text style={styles.doneText}>{queue.length ? 'Your verses will come back when it is time.' : 'Come back tomorrow, or add a verse from the reader.'}</Text>
          <View style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}><Button label="Done" onPress={() => router.back()} /></View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 56 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  cardWrap: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  card: { minHeight: 320, borderRadius: 28, backgroundColor: colors.card, padding: 28, justifyContent: 'center' },
  cardOpen: { backgroundColor: colors.cardSelected },
  ref: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 56, lineHeight: 58, color: colors.text },
  hint: { marginTop: 14, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  verse: { marginTop: 18, fontFamily: fonts.scripture, fontSize: 22, lineHeight: 34, color: colors.text },
  footer: { padding: spacing.lg },
  row: { flexDirection: 'row', gap: 12 },
  done: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  doneTitle: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  doneText: { marginTop: 8, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textSecondary },
});
