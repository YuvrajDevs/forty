import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

const OPTIONS = ["Catholic","Orthodox","Protestant","Baptist","Pentecostal","Anglican","Evangelical","Non-denominational","Other","Prefer not to say"];

export default function Screen() {
  const value = useOnboarding().denomination;
  return (
    <Quiz step={2} title="Your denomination" subtitle="We use this to pick the right books and translation. It stays on your phone." ctaDisabled={!value} onContinue={() => router.push('/onboarding/gender')}>
      {OPTIONS.map((o) => (
        <Option key={o} label={o} selected={value === o} onPress={() => setOnboarding({ denomination: o, translation: o === 'Catholic' ? 'drc' : 'web' })} />
      ))}
    </Quiz>
  );
}
