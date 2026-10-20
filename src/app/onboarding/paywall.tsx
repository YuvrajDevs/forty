import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { getOnboarding, setOnboarding, useOnboarding } from '../../lib/onboarding';
import { addActiveDays, iso } from '../../lib/schedule';
import { summarize } from '../../lib/plan';
import { chaptersFor, SCOPES } from '../../lib/scopes';
import { colors, fonts, radius, spacing } from '../../theme';

type PlanId = 'weekly' | 'yearly';
// Placeholder prices until they are read from Google Play Billing.
const PLANS: Record<PlanId, { title: string; price: string; per: string; note: string }> = {
  yearly: { title: 'Yearly', price: '$39.99', per: 'year', note: 'About $0.77 a week. Save 85%' },
  weekly: { title: 'Weekly', price: '$4.99', per: 'week', note: 'Billed every week' },
};
const BENEFITS = ['App lock until you have read', 'A plan you will finish', 'Daily check-in and journal'];

export default function Paywall() {
  const { scope, days } = useOnboarding();
  const [plan, setPlan] = useState<PlanId>('yearly');
  const s = summarize(chaptersFor(scope), days);
  const title = SCOPES.find((x) => x.id === scope)?.title ?? '';
  const chosen = PLANS[plan];

  const start = () => {
    const { lockDays } = getOnboarding();
    setOnboarding({
      completed: true,
      startedOn: iso(new Date()),
      deadline: iso(addActiveDays(new Date(), days, lockDays)),
      dayPlan: null,
      readChapters: [],
      doneDates: [],
    });
    router.replace('/today');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Image source={require('../../../assets/images/sunrise.webp')} style={styles.sun} resizeMode="cover" accessibilityLabel="A sunrise" />
        <Text style={styles.title}>Start your 7-day free trial</Text>
        <Text style={styles.planLine}>
          {title} in {days} days {'·'} {s.locksPerDay} {s.locksPerDay === 1 ? 'reading' : 'readings'} a day
        </Text>
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <Text key={b} style={styles.benefit}>
              {'✓'}  {b}
            </Text>
          ))}
        </View>
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          const on = plan === id;
          return (
            <Pressable key={id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPlan(id)} style={[styles.card, on && styles.cardOn]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardNote}>7 days free {'·'} {p.note}</Text>
              </View>
              <Text style={styles.cardPrice}>
                {p.price}
                <Text style={styles.cardPer}> / {p.per}</Text>
              </Text>
            </Pressable>
          );
        })}
        <Text style={styles.fine}>
          No payment now. 7 days free, then {chosen.price}/{chosen.per}. Cancel any time in Google Play.
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Start free trial" onPress={start} />
        <View style={styles.links}>
          <Text style={styles.link}>Restore purchases</Text>
          <Text style={styles.link}>Terms</Text>
          <Text style={styles.link}>Privacy</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg },
  sun: { width: '100%', height: 170, borderRadius: radius.card },
  title: { marginTop: spacing.lg, fontFamily: fonts.display, includeFontPadding: false, fontSize: 48, lineHeight: 50, color: colors.text },
  planLine: { marginTop: 8, fontFamily: fonts.medium, fontSize: 15, color: colors.gold },
  benefits: { marginVertical: spacing.md, gap: 6 },
  benefit: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { backgroundColor: colors.cardSelected, borderColor: colors.gold },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  cardNote: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  cardPrice: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  cardPer: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  fine: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.textSecondary, textAlign: 'center' },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 14 },
  link: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textDecorationLine: 'underline' },
});
