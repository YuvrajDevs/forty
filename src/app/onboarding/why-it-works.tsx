import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { colors, fonts, radius } from '../../theme';

const POINTS = [
  { title: 'Scripture before scrolling', body: 'Your apps stay locked until you have read. The habit you already have becomes the reminder.' },
  { title: 'A plan you can actually finish', body: 'Pick what to read and by when. You see your finish date before you start.' },
  { title: 'A gentle daily check-in', body: 'A quiet moment to notice how you are, with a verse for where you are today.' },
];

export default function WhyItWorks() {
  return (
    <Quiz
      title="Why it works"
      subtitle="Small, steady reading is easier to keep up than occasional long sessions."
      onContinue={() => router.push('/onboarding/paywall')}
    >
      {POINTS.map((p, i) => (
        <View key={p.title} style={styles.card}>
          <Text style={styles.num}>{i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.title}</Text>
            <Text style={styles.body}>{p.body}</Text>
          </View>
        </View>
      ))}
    </Quiz>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 16, backgroundColor: colors.card, borderRadius: radius.card, padding: 20, marginBottom: 12 },
  num: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 40, lineHeight: 42, color: colors.gold },
  name: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  body: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
});
