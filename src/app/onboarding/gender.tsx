import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

const OPTIONS = ["Male","Female","Prefer not to say"];

export default function Screen() {
  const value = useOnboarding().gender;
  return (
    <Quiz step={3} title="Gender (optional)" subtitle="Only used to suggest plans and wording. Never shared, never used for ads." ctaDisabled={!value} onContinue={() => router.push('/onboarding/age')}>
      {OPTIONS.map((o) => (
        <Option key={o} label={o} selected={value === o} onPress={() => { setOnboarding({ gender: o }); setTimeout(() => router.push('/onboarding/age'), 220); }} />
      ))}
    </Quiz>
  );
}
