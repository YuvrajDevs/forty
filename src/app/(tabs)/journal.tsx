import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { CONNECTION } from '../../lib/checkin';
import { useOnboarding } from '../../lib/onboarding';
import { addDays, iso, weekdayIndex } from '../../lib/schedule';
import { colors, fonts, radius, spacing } from '../../theme';

// One dot colour per connection score, from distant to very close.
const DOT = ['#C9BFA4', '#E3C56A', '#F0B429', '#9CB78A', '#4F7A4A'];
const HEAD = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Journal() {
  const { checkins } = useOnboarding();
  const now = new Date();
  const todayIso = iso(now);
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(todayIso);
  const byDate = new Map(checkins.map((c) => [c.date, c]));
  const entry = byDate.get(selected);

  const lead = weekdayIndex(month);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => addDays(month, i))];
  while (cells.length % 7) cells.push(null);
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const nice = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>FORTYBIBLE</Text>
        <Text style={styles.title}>Journal</Text>

        <View style={styles.cal}>
          <View style={styles.nav}>
            <Pressable accessibilityLabel="Previous month" hitSlop={10} onPress={() => shift(-1)}><Ionicons name="chevron-back" size={22} color={colors.text} /></Pressable>
            <Text style={styles.month}>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text>
            <Pressable accessibilityLabel="Next month" hitSlop={10} onPress={() => shift(1)}><Ionicons name="chevron-forward" size={22} color={colors.text} /></Pressable>
          </View>
          <View style={styles.row}>{HEAD.map((h, i) => <Text key={i} style={styles.head}>{h}</Text>)}</View>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <View key={r} style={styles.row}>
              {cells.slice(r * 7, r * 7 + 7).map((d, c) => {
                if (!d) return <View key={c} style={styles.cell} />;
                const key = iso(d);
                const e = byDate.get(key);
                return (
                  <Pressable key={c} style={styles.cell} onPress={() => setSelected(key)}>
                    <View style={[styles.day, key === selected && styles.daySel, key === todayIso && styles.dayToday]}>
                      <Text style={styles.dayText}>{d.getDate()}</Text>
                    </View>
                    <View style={[styles.dot, { backgroundColor: e ? DOT[e.connection - 1] : 'transparent' }]} />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={styles.section}>{selected === todayIso ? 'Today' : nice(selected)}</Text>
        {entry ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{CONNECTION[entry.connection - 1]}</Text>
            {entry.feelings.length ? <Text style={styles.feelings}>{entry.feelings.join(' · ')}</Text> : null}
            {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
            <Text style={styles.verse}>{entry.verse}</Text>
          </View>
        ) : (
          <Text style={styles.empty}>
            {selected > todayIso ? 'Nothing here yet.' : selected === todayIso ? 'How is your heart today? It takes about 30 seconds.' : 'No check-in on this day.'}
          </Text>
        )}
        {selected === todayIso ? (
          <View style={{ marginTop: spacing.md }}>
            <Button label={entry ? 'Update today’s check-in' : 'Check in'} onPress={() => router.push('/checkin')} />
          </View>
        ) : null}
        <Text style={styles.private}>Private. Only on this phone. Never shared and never used for ads.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  cal: { marginTop: spacing.lg, backgroundColor: colors.card, borderRadius: radius.card, padding: 16 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  month: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  row: { flexDirection: 'row' },
  head: { flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary, paddingVertical: 6 },
  cell: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  daySel: { backgroundColor: colors.cardSelected },
  dayToday: { borderColor: colors.gold },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm, fontFamily: fonts.display, includeFontPadding: false, fontSize: 30, lineHeight: 32, color: colors.text },
  card: { backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 20 },
  cardTitle: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 34, lineHeight: 36, color: colors.text },
  feelings: { marginTop: 4, fontFamily: fonts.medium, fontSize: 14, color: colors.gold },
  note: { marginTop: 10, fontFamily: fonts.scripture, fontSize: 16, lineHeight: 26, color: colors.text },
  verse: { marginTop: 12, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, color: colors.textSecondary },
  empty: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  private: { marginTop: spacing.lg, textAlign: 'center', fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
