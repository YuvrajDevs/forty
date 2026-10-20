import { router } from 'expo-router';
import { Quiz } from '../../components/Quiz';
import { setOnboarding } from '../../lib/onboarding';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

async function askForNotifications(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export default function Notifications() {
  return (
    <Quiz
      step={12}
      title="A gentle reminder each day?"
      subtitle="We'll also tell you before your free trial ends, so there are no surprises."
      cta="Yes, remind me"
      onContinue={async () => {
        setOnboarding({ remindersOn: await askForNotifications() });
        router.push('/onboarding/journey');
      }}
      secondary={{ label: 'Not now', onPress: () => router.push('/onboarding/journey') }}
    >
      <Text style={styles.body}>
        One quiet nudge a day, at a time that suits you. You can change or turn it off in Settings whenever you like.
      </Text>
    </Quiz>
  );
}

const styles = StyleSheet.create({ body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.text } });
