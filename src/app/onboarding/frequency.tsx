import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

const OPTIONS = ["Never","Rarely","Sometimes","Weekly"];

export default function Screen() {
  const value = useOnboarding().frequency;
  return (
    <Quiz step={7} title="How often do you read the Bible now?" subtitle="Be honest. We will start where you are." ctaDisabled={!value} onContinue={() => router.push('/onboarding/goal')}>
      {OPTIONS.map((o) => (
        <Option key={o} label={o} selected={value === o} onPress={() => { setOnboarding({ frequency: o }); setTimeout(() => router.push('/onboarding/goal'), 220); }} />
      ))}
    </Quiz>
  );
}
