import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
  yearly: { title: 'Yearly', price: '$39.99', per: 'year', note: '7 days free \u00B7 Save 85%' },
  weekly: { title: 'Weekly', price: '$4.99', per: 'week', note: '7 days free' },
};
const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'lock-closed-outline', text: 'Lock apps until you read' },
  { icon: 'heart-outline', text: 'Get closer to God' },
  { icon: 'book-outline', text: 'Read the Bible every day' },
];

const IMG_W = 1200;
const IMG_H = 589;
const coverTop = ({ width, height }: { width: number; height: number }) => {
  const scale = Math.max(width / IMG_W, height / IMG_H) || 1;
  return { position: 'absolute' as const, top: 0, left: (width - IMG_W * scale) / 2, width: IMG_W * scale, height: IMG_H * scale };
};

export default function Paywall() {
  const { scope, days, translation } = useOnboarding();
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [box, setBox] = useState({ width: 0, height: 0 });
  const s = summarize(chaptersFor(scope, translation), days);
  const title = SCOPES.find((x) => x.id === scope)?.title ?? '';
  const chosen = PLANS[plan];

  const start = () => {
    const { lockDays } = getOnboarding();
    setOnboarding({
      completed: true,
      startedOn: iso(new Date()),
      trialStartedAt: iso(new Date()),
      deadline: iso(addActiveDays(new Date(), days, lockDays)),
      dayPlan: null,
      readChapters: [],
      doneDates: [],
    });
    router.replace('/today');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.sun} onLayout={(e) => setBox(e.nativeEvent.layout)}>
        {/* Scaled to cover the box but anchored to the top, so the sun stays in view. */}
        <Image source={require('../../../assets/images/sunrise.webp')} style={coverTop(box)} accessibilityLabel="A sunrise" />
        <LinearGradient colors={['rgba(250,246,234,0)', colors.background]} style={styles.sunFade} pointerEvents="none" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Start your 7-day free trial</Text>
        <Text style={styles.planLine}>
          {title} in {days} days {'\u00B7'} {s.locksPerDay} {s.locksPerDay === 1 ? 'reading' : 'readings'} a day
        </Text>
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefit}>
              <Ionicons name={b.icon} size={22} color={colors.gold} />
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          const on = plan === id;
          return (
            <Pressable key={id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPlan(id)} style={[styles.card, on && styles.cardOn]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardNote}>{p.note}</Text>
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
  // The image takes whatever height the content below leaves, so nothing needs to scroll.
  sun: { width: '100%', flex: 1, minHeight: 90, overflow: 'hidden' },
  sunFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 42, lineHeight: 44, color: colors.text },
  planLine: { marginTop: 4, fontFamily: fonts.medium, fontSize: 14, color: colors.gold },
  benefits: { marginTop: 12, marginBottom: 12, gap: 8 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.card, paddingVertical: 12, paddingHorizontal: 18, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { backgroundColor: colors.cardSelected, borderColor: colors.gold },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  cardNote: { marginTop: 1, fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  cardPrice: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  cardPer: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  fine: { marginBottom: 10, fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: colors.textSecondary, textAlign: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 },
  link: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, textDecorationLine: 'underline' },
});
