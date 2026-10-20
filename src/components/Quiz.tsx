import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';
import { Button } from './Button';

export const TOTAL_STEPS = 9;

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  cta?: string;
  ctaDisabled?: boolean;
  onContinue: () => void;
};

export function Quiz({ step, title, subtitle, children, cta = 'Continue', ctaDisabled, onContinue }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={{ marginTop: spacing.lg }}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label={cta} disabled={ctaDisabled} onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

export function Option({ label, hint, selected, onPress }: { label: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <Text style={styles.optionLabel}>{label}</Text>
      {hint ? <Text style={styles.optionHint}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { fontFamily: fonts.body, fontSize: 32, lineHeight: 34, color: colors.text, includeFontPadding: false },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#EADFC2', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },
  body: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 38, color: colors.text },
  subtitle: { marginTop: spacing.sm, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  footer: { padding: spacing.lg, paddingBottom: spacing.lg },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: '#EADFC2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  optionSelected: { borderColor: colors.gold, backgroundColor: '#FFFBEF' },
  optionLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  optionHint: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
});
