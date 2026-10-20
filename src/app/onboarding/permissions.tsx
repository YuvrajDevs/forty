import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { colors, fonts, radius } from '../../theme';

const PERMISSIONS = [
  { title: 'Accessibility', why: 'Lets Forty notice when one of your chosen apps opens, so it can ask you to read first. Forty never reads what is on your screen.' },
  { title: 'Display over other apps', why: 'Lets Forty show the reading prompt on top of a locked app.' },
  { title: 'Usage access', why: 'Helps Forty tell which app is in front so it only locks the ones you picked.' },
];

export default function Permissions() {
  return (
    <Quiz
      step={11}
      title="Three quick permissions"
      subtitle="Android needs your OK for the lock to work. Each one has a plain reason, and you can turn them off any time."
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
  card: { flexDirection: 'row', gap: 16, backgroundColor: colors.card, borderRadius: radius.card, padding: 20, marginBottom: 12 },
  num: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 36, lineHeight: 38, color: colors.gold },
  name: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
  why: { marginTop: 4, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
});
