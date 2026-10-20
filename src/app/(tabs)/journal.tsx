import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { verseText } from '../../lib/bible';
import { CONNECTION, pickVerse } from '../../lib/checkin';
import type { Checkin } from '../../lib/onboarding';
import { useOnboarding } from '../../lib/onboarding';
import { iso } from '../../lib/schedule';
import { colors, fonts, radius, spacing } from '../../theme';

// One dot colour per connection score, from distant to very close.
const DOT = ['#C9BFA4', '#E3C56A', '#F0B429', '#9CB78A', '#4F7A4A'];

const monthKey = (date: string) => date.slice(0, 7);
const monthTitle = (key: string) => new Date(key + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
const dayTitle = (date: string) => new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export default function Journal() {
  const { checkins, translation } = useOnboarding();
  const today = iso(new Date());
  const [selected, setSelected] = useState<Checkin | null>(null);

  // Newest first, grouped by month.
  const sorted = [...checkins].sort((a, b) => (a.date < b.date ? 1 : -1));
  const months: { key: string; entries: Checkin[] }[] = [];
  for (const c of sorted) {
    const key = monthKey(c.date);
    const last = months[months.length - 1];
    if (last?.key === key) last.entries.push(c);
    else months.push({ key, entries: [c] });
  }
  const doneToday = checkins.some((c) => c.date === today);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>FORTYBIBLE</Text>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.private}>Private. Only on this phone. Never shared and never used for ads.</Text>

        <View style={{ marginTop: spacing.lg }}>
          <Button label={doneToday ? 'Update today’s check-in' : 'Check in'} onPress={() => router.push('/checkin')} />
        </View>

        {months.length === 0 ? (
          <Text style={styles.empty}>Your check-ins will appear here, month by month. How is your heart today? It takes about 30 seconds.</Text>
        ) : null}

        {months.map((m) => (
          <View key={m.key}>
            <Text style={styles.month}>{monthTitle(m.key)}</Text>
            {m.entries.map((e) => (
              <Pressable key={e.date} accessibilityRole="button" onPress={() => setSelected(e)} style={styles.card}>
                <View style={styles.head}>
                  <View style={[styles.dot, { backgroundColor: DOT[e.connection - 1] }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.date}>{dayTitle(e.date)}</Text>
                    <Text style={styles.sub}>{CONNECTION[e.connection - 1]} {'\u00B7'} {e.verse}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          {selected ? <Entry entry={selected} translation={translation} onClose={() => setSelected(null)} /> : null}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Entry({ entry, translation, onClose }: { entry: Checkin; translation: Parameters<typeof verseText>[0]; onClose: () => void }) {
  // The same verse and line the check-in gave that day.
  const pick = pickVerse(entry.connection, entry.feelings);
  const text = verseText(translation, pick.ref.bookId, pick.ref.chapter, pick.ref.verse);
  return (
    // Stops taps inside the popup from closing it.
    <Pressable style={styles.popup} onPress={() => {}}>
      <View style={styles.popupHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.popupDate}>{dayTitle(entry.date)}</Text>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: DOT[entry.connection - 1] }]} />
            <Text style={styles.popupConn}>{CONNECTION[entry.connection - 1]}</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Close" hitSlop={12} onPress={onClose} style={styles.close}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
        {entry.feelings.length ? <Text style={styles.feelings}>{entry.feelings.join(' \u00B7 ')}</Text> : null}
        {entry.note ? <Text style={styles.note}>{entry.note}</Text> : <Text style={styles.noNote}>No note this day.</Text>}
        <Text style={styles.wordLabel}>WORD FOR THE DAY</Text>
        <View style={styles.verseCard}>
          <Text style={styles.verse}>{text}</Text>
          <Text style={styles.ref}>{pick.ref.label}</Text>
        </View>
        <Text style={styles.line}>{pick.line}</Text>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  private: { marginTop: 6, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  month: { marginTop: spacing.xl, marginBottom: spacing.sm, fontFamily: fonts.display, includeFontPadding: false, fontSize: 30, lineHeight: 32, color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  date: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  sub: { marginTop: 1, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  feelings: { fontFamily: fonts.medium, fontSize: 14, color: colors.gold },
  note: { marginTop: 8, fontFamily: fonts.scripture, fontSize: 16, lineHeight: 26, color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.45)', justifyContent: 'center', padding: spacing.lg },
  popup: { backgroundColor: colors.background, borderRadius: 28, padding: 22 },
  popupHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  popupDate: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 36, lineHeight: 38, color: colors.text },
  popupConn: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  wordLabel: { marginTop: spacing.lg, fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  verseCard: { marginTop: 8, backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 18 },
  verse: { fontFamily: fonts.scripture, fontSize: 18, lineHeight: 28, color: colors.text },
  ref: { marginTop: 10, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, color: colors.gold },
  line: { marginTop: 12, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.text },
  noNote: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  empty: { marginTop: spacing.xl, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
});
