import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addDays, fromIso, isActive, iso, weekdayIndex } from '../lib/schedule';
import { colors, fonts } from '../theme';

type Props = { doneDates: string[]; lockDays: boolean[]; startedOn: string | null; deadline: string | null };

const HEAD = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function Calendar({ doneDates, lockDays, startedOn, deadline }: Props) {
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const done = new Set(doneDates);
  const todayIso = iso(now);
  const start = startedOn ? fromIso(startedOn) : now;
  const end = deadline ? fromIso(deadline) : null;

  const first = month;
  const lead = weekdayIndex(first);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7) cells.push(null);

  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const label = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Pressable accessibilityLabel="Previous month" hitSlop={10} onPress={() => shift(-1)}><Text style={styles.arrow}>{'‹'}</Text></Pressable>
        <Text style={styles.month}>{label}</Text>
        <Pressable accessibilityLabel="Next month" hitSlop={10} onPress={() => shift(1)}><Text style={styles.arrow}>{'›'}</Text></Pressable>
      </View>
      <View style={styles.row}>
        {HEAD.map((h, i) => <Text key={i} style={styles.head}>{h}</Text>)}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((d, c) => {
            if (!d) return <View key={c} style={styles.cell} />;
            const key = iso(d);
            const isDone = done.has(key);
            const isToday = key === todayIso;
            const isEnd = end ? key === iso(end) : false;
            const planned = end ? d >= start && d <= end && isActive(d, lockDays) : false;
            const missed = !isDone && planned && key < todayIso;
            return (
              <View key={c} style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    planned && !isDone && !missed && styles.planned,
                    missed && styles.missed,
                    isDone && styles.doneDay,
                    isEnd && styles.endDay,
                    isToday && styles.today,
                  ]}
                >
                  <Text style={[styles.dayText, isDone && styles.dayTextOn]}>{d.getDate()}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
      <View style={styles.legend}>
        <Legend color={colors.green} label="Done" />
        <Legend color={colors.primary} label="Finish" />
        <Legend color={colors.cardSelected} label="Planned" />
      </View>
    </View>
  );
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: 22, padding: 16 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  arrow: { fontFamily: fonts.body, fontSize: 28, lineHeight: 30, color: colors.text, paddingHorizontal: 8 },
  month: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  row: { flexDirection: 'row' },
  head: { flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary, paddingVertical: 6 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: '84%', aspectRatio: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  planned: { backgroundColor: colors.cardSelected },
  missed: { backgroundColor: '#EFE9D8' },
  doneDay: { backgroundColor: colors.green },
  endDay: { backgroundColor: colors.primary },
  today: { borderColor: colors.gold },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  dayTextOn: { color: '#FFFFFF' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
