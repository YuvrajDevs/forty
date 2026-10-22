import { Redirect, router } from 'expo-router';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useOnboarding } from '../lib/onboarding';
import { fonts, spacing, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

export default function Welcome() {
  const styles = useStyles(createStyles);
  const { completed } = useOnboarding();
  const { width, height } = useWindowDimensions();
  const size = Math.min(width - 24, 400, height * 0.4);
  if (completed) return <Redirect href="/today" />;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.brand}>FORTYBIBLE</Text>
      <View style={styles.center}>
        <Image source={require('../../assets/images/bible.webp')} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="A Bible" />
        <Text style={styles.title}>Put God before the scroll.</Text>
        <Text style={styles.subtitle}>Start each day with God's Word.</Text>
      </View>
      <View style={styles.footer}>
        <Button label="Begin" onPress={() => router.push('/onboarding/why')} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  brand: { marginTop: spacing.md, textAlign: 'center', fontFamily: fonts.medium, fontSize: 13, letterSpacing: 2, color: colors.textSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { marginTop: spacing.lg, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, letterSpacing: 1, color: colors.text, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, fontFamily: fonts.light, fontSize: 16, color: colors.text, textAlign: 'center' },
  footer: { padding: spacing.lg },
});
