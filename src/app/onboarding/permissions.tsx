import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { colors, fonts, radius } from '../../theme';

const PERMISSIONS = [
  { title: 'Accessibility', why: 'Lets FortyBible notice when a chosen app opens so it can ask you to read first. It never reads your screen.' },
  { title: 'Display over other apps', why: 'Shows the reading prompt on top of a locked app.' },
  { title: 'Usage access', why: 'Tells which app is in front, so only the ones you picked are locked.' },
];

export default function Permissions() {
  return (
    <Quiz
      compact
      step={11}
      title="Three quick permissions"
      subtitle="Android needs your OK for the lock to work. You can turn each off any time."
      onContinue={() => router.push('/onboarding/notifications')}
      cta="Continue"
    >
      {PERMISSIONS.map((p, i) => (
        <View key={p.title} style={styles.card}>
          <Text style={styles.num}>{i + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{p.title}</Text>
            <Text style={styles.why}>{p.why}</Text>
          </View>
        </View>
      ))}
    </Quiz>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 14, backgroundColor: colors.card, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 10 },
  num: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 32, lineHeight: 34, color: colors.gold },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  why: { marginTop: 2, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
});
