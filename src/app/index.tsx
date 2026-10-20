import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { colors, fonts, spacing } from '../theme';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Put God before the scroll.</Text>
        <Text style={styles.subtitle}>Read the Bible before you scroll.</Text>
      </View>
      <Button label="Begin" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingBottom: spacing.xxl, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 46, color: colors.text, textAlign: 'center' },
  subtitle: { marginTop: spacing.md, fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
});
