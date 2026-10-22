import { router } from 'expo-router';
import { Quiz } from '../../components/Quiz';
import { requestNotificationPermission } from '../../lib/notifications';
import { setOnboarding } from '../../lib/onboarding';
import { Text, StyleSheet } from 'react-native';
import { fonts, useColors, useStyles } from '../../theme';
import type { Palette } from '../../theme';

export default function Notifications() {
  const styles = useStyles(createStyles);
  return (
    <Quiz
      step={13}
      title="A gentle reminder each day?"
      subtitle="We'll also tell you before your free trial ends, so there are no surprises."
      cta="Yes, remind me"
      onContinue={async () => {
        setOnboarding({ remindersOn: await requestNotificationPermission() });
        router.push('/onboarding/journey');
      }}
      secondary={{ label: 'Not now', onPress: () => router.push('/onboarding/journey') }}
    >
      <Text style={styles.body}>
        One quiet nudge a day. You can turn it off any time in your phone's notification settings.
      </Text>
    </Quiz>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({ body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.text } });
