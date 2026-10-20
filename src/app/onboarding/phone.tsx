import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';
import { colors, fonts } from '../../theme';

export default function Phone() {
  const { phoneHours } = useOnboarding();
  return (
    <Quiz step={4} title="How much time do you spend on your phone each day?" subtitle="A rough guess is fine." onContinue={() => router.push('/onboarding/reveal')}>
      <View style={styles.center}>
        <Text style={styles.value}>{phoneHours >= 10 ? '10+' : phoneHours}</Text>
        <Text style={styles.unit}>hours a day</Text>
      </View>
      <Slider
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={phoneHours}
        onValueChange={(v) => setOnboarding({ phoneHours: v })}
        minimumTrackTintColor={colors.gold}
        maximumTrackTintColor="#EADFC2"
        thumbTintColor={colors.gold}
        accessibilityLabel="Hours on phone per day"
      />
      <View style={styles.ends}>
        <Text style={styles.end}>1 hr</Text>
        <Text style={styles.end}>10+ hrs</Text>
      </View>
    </Quiz>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginVertical: 24 },
  value: { fontFamily: fonts.display, fontSize: 72, lineHeight: 84, color: colors.text },
  unit: { fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary },
  ends: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  end: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
