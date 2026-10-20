import { Redirect, router } from 'expo-router';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useOnboarding } from '../lib/onboarding';
import { colors, fonts, spacing } from '../theme';

export default function Welcome() {
  const { completed } = useOnboarding();
  const { width } = useWindowDimensions();
  const size = Math.min(width - 48, 340);
  if (completed) return <Redirect href="/today" />;
  return (
    <SafeAreaView style={styles.container}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, letterSpacing: 1, color: colors.text, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, fontFamily: fonts.medium, fontSize: 19, color: colors.text, textAlign: 'center' },
  footer: { padding: spacing.lg },
});
