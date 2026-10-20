import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { CONNECTION } from '../../lib/checkin';
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
  const { checkins } = useOnboarding();
  const today = iso(new Date());
  const [open, setOpen] = useState<string | null>(null);

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
            {m.entries.map((e) => {
              const isOpen = open === e.date;
              return (
                <Pressable
                  key={e.date}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  onPress={() => setOpen(isOpen ? null : e.date)}
                  style={[styles.card, isOpen && styles.cardOpen]}
                >
                  <View style={styles.head}>
                    <View style={[styles.dot, { backgroundColor: DOT[e.connection - 1] }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.date}>{dayTitle(e.date)}</Text>
                      <Text style={styles.sub}>{CONNECTION[e.connection - 1]} {'·'} {e.verse}</Text>
                    </View>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
                  </View>
                  {isOpen ? (
                    <View style={styles.more}>
                      {e.feelings.length ? <Text style={styles.feelings}>{e.feelings.join(' · ')}</Text> : null}
                      {e.note ? <Text style={styles.note}>{e.note}</Text> : <Text style={styles.noNote}>No note this day.</Text>}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  cardOpen: { backgroundColor: colors.cardSelected },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  date: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  sub: { marginTop: 1, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  more: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  feelings: { fontFamily: fonts.medium, fontSize: 14, color: colors.gold },
  note: { marginTop: 8, fontFamily: fonts.scripture, fontSize: 16, lineHeight: 26, color: colors.text },
  noNote: { marginTop: 8, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  empty: { marginTop: spacing.xl, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
});
