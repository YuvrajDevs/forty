import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetOnboarding, useOnboarding } from '../lib/onboarding';
import { buildPlan } from '../lib/plan';
import { chaptersFor, SCOPES } from '../lib/scopes';
import { colors, fonts, radius, spacing } from '../theme';

export default function Home() {
  const { scope, days, startedOn } = useOnboarding();
  const plan = buildPlan(chaptersFor(scope), days);
  const today = plan[0];
  const title = SCOPES.find((s) => s.id === scope)?.title ?? '';
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  void startedOn;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.eyebrow}>FORTY</Text>
        <Text style={styles.title}>Good morning.</Text>
        <Text style={styles.sub}>{date} {'·'} {title}, {days} days</Text>
        <View style={{ marginTop: spacing.lg }}>
          {today?.readings.map((r, i) => (
            <View key={i} style={[styles.card, i === 0 && styles.cardFirst]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{r.label}</Text>
                <Text style={styles.cardHint}>{r.minutes} min</Text>
              </View>
              <View style={[styles.radio, i === 0 && styles.radioOn]} />
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => {
            resetOnboarding();
            router.replace('/');
          }}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Restart onboarding</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  sub: { marginTop: 6, fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: 20, marginBottom: 12 },
  cardFirst: { backgroundColor: colors.cardSelected },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  cardHint: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#BDB398' },
  radioOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  reset: { marginTop: spacing.xl, alignItems: 'center', padding: 12 },
  resetText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textDecorationLine: 'underline' },
});
