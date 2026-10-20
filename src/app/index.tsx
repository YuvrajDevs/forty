import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors, fonts, spacing } from '../theme';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Put God before the scroll.</Text>
        <Text style={styles.subtitle}>Read the Bible before you scroll.</Text>
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
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 46, color: colors.text, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  footer: { padding: spacing.lg },
});
