import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEGAL, SUPPORT_EMAIL } from '../lib/legal';
import { colors, fonts, spacing } from '../theme';

export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const page = LEGAL.find((d) => d.id === doc) ?? LEGAL[0];
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{page.title}</Text>
        {page.sections.map((s) => (
          <View key={s.heading} style={{ marginTop: spacing.lg }}>
            <Text style={styles.heading}>{s.heading}</Text>
            <Text style={styles.text}>{s.body}</Text>
          </View>
        ))}
        {SUPPORT_EMAIL ? <Text style={[styles.text, { marginTop: spacing.lg }]}>Contact: {SUPPORT_EMAIL}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 48, justifyContent: 'center' },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 52, lineHeight: 54, color: colors.text },
  heading: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  text: { marginTop: 4, fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
});
