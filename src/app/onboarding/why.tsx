import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

const OPTIONS = ["Grow closer to God","Build a daily habit","Understand Scripture","Going through a hard season"];

export default function Screen() {
  const value = useOnboarding().why;
  return (
    <Quiz step={1} title="Why are you here?" subtitle="There is no wrong answer. This helps us shape your plan." ctaDisabled={!value} onContinue={() => router.push('/onboarding/denomination')}>
      {OPTIONS.map((o) => (
        <Option key={o} label={o} selected={value === o} onPress={() => { setOnboarding({ why: o }); setTimeout(() => router.push('/onboarding/denomination'), 220); }} />
      ))}
    </Quiz>
  );
}
