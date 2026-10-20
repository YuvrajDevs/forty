import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOnboarding, setOnboarding, useOnboarding } from '../../lib/onboarding';
import { summarize } from '../../lib/plan';
import { addActiveDays, iso } from '../../lib/schedule';
import { chaptersFor, SCOPES } from '../../lib/scopes';
import { fonts } from '../../theme';

type PlanId = 'weekly' | 'yearly';
// Placeholder prices until they are read from Google Play Billing.
const PLANS: Record<PlanId, { title: string; price: string; per: string; note: string }> = {
  yearly: { title: 'Yearly', price: '$39.99', per: 'year', note: '7 days free · Save 85%' },
  weekly: { title: 'Weekly', price: '$4.99', per: 'week', note: '7 days free' },
};
const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'lock-closed-outline', text: 'Lock your apps until you read' },
  { icon: 'heart-outline', text: 'Get closer to God' },
  { icon: 'book-outline', text: 'Read the Bible every day' },
];

const GOLD = '#FFB020';
const GOLD_DEEP = '#F59A00';
const CREAM = '#FAF6EA';

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
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={require('../../../assets/images/sunrise.webp')} style={styles.image} resizeMode="cover" accessibilityLabel="A sunrise" />
      <LinearGradient colors={['rgba(255,176,32,0)', GOLD, GOLD_DEEP]} locations={[0, 0.55, 1]} style={styles.fade} pointerEvents="none" />
      <LinearGradient colors={['rgba(250,246,234,0)', CREAM]} style={styles.footerFade} pointerEvents="none" />

      <SafeAreaView style={styles.content} edges={['bottom']}>
        <View style={styles.top}>
          <Text style={styles.title}>Start your 7-day free trial</Text>
          <Text style={styles.planLine}>
            {title} in {days} days {'·'} {s.locksPerDay} {s.locksPerDay === 1 ? 'reading' : 'readings'} a day
          </Text>
          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.text} style={styles.benefit}>
                <Ionicons name={b.icon} size={26} color="#FFFFFF" />
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottom}>
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const p = PLANS[id];
            const on = plan === id;
            return (
              <Pressable key={id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPlan(id)} style={[styles.card, on && styles.cardOn]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{p.title}</Text>
                  <Text style={styles.cardNote}>{p.note}</Text>
                </View>
                {on ? (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>No payment now</Text>
                  </View>
                ) : (
                  <Text style={styles.cardPrice}>{p.price}<Text style={styles.cardPer}> / {p.per}</Text></Text>
                )}
              </Pressable>
            );
          })}
          <Text style={styles.fine}>
            7 days free, then {chosen.price}/{chosen.per}. Cancel any time in Google Play.
          </Text>
          <Pressable accessibilityRole="button" onPress={start} style={({ pressed }) => [styles.ctaWrap, pressed && { opacity: 0.9 }]}>
            <LinearGradient colors={['#FFD33D', '#FFA114']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaText}>Start free trial</Text>
            </LinearGradient>
          </Pressable>
          <View style={styles.links}>
            <Text style={styles.link}>Restore purchases</Text>
            <Text style={styles.link}>Terms</Text>
            <Text style={styles.link}>Privacy</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const shadow = { textShadowColor: 'rgba(120,60,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 } as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GOLD_DEEP },
  image: { position: 'absolute', top: 0, left: 0, right: 0, height: '62%' },
  fade: { position: 'absolute', top: '22%', left: 0, right: 0, bottom: 0 },
  footerFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '24%' },
  content: { flex: 1, justifyContent: 'flex-end' },
  top: { paddingHorizontal: 24, paddingBottom: 14 },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 52, lineHeight: 52, color: '#FFFFFF', letterSpacing: 0.5, ...shadow },
  planLine: { marginTop: 6, fontFamily: fonts.medium, fontSize: 15, color: '#FFFFFF', ...shadow },
  benefits: { marginTop: 14, gap: 10 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitText: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: '#FFFFFF', ...shadow },
  bottom: { paddingHorizontal: 20, paddingBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 22, paddingVertical: 12, paddingHorizontal: 18, marginBottom: 10, borderWidth: 2.5, borderColor: 'transparent' },
  cardOn: { backgroundColor: '#FFFFFF', borderColor: '#D98200' },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 18, color: '#1A1A1A' },
  cardNote: { marginTop: 1, fontFamily: fonts.body, fontSize: 13, color: '#5C5648' },
  cardPrice: { fontFamily: fonts.semibold, fontSize: 17, color: '#1A1A1A' },
  cardPer: { fontFamily: fonts.body, fontSize: 12, color: '#5C5648' },
  pill: { backgroundColor: '#FFB020', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12 },
  pillText: { fontFamily: fonts.semibold, fontSize: 13, color: '#1A1A1A' },
  fine: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: '#4A3F1A', textAlign: 'center', marginBottom: 10 },
  ctaWrap: { borderRadius: 30, shadowColor: '#E58A00', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  cta: { height: 58, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, color: '#1A1A1A', paddingHorizontal: 8 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 8 },
  link: { fontFamily: fonts.body, fontSize: 12, color: '#7A7261', textDecorationLine: 'underline' },
});
