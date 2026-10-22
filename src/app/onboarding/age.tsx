import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

const OPTIONS = ['13 to 17', '18 to 24', '25 to 34', '35 to 44', '45 to 54', '55 and over', 'Prefer not to say'];

export default function Screen() {
  const value = useOnboarding().ageRange;
  return (
    <Quiz step={4} title="How old are you?" subtitle="A rough range is fine. It only helps us pick the right tone and plans. It stays on your phone." ctaDisabled={!value} onContinue={() => router.push('/onboarding/phone')}>
      {OPTIONS.map((o) => (
        <Option key={o} label={o} selected={value === o} onPress={() => { setOnboarding({ ageRange: o }); setTimeout(() => router.push('/onboarding/phone'), 220); }} />
      ))}
    </Quiz>
  );
}
