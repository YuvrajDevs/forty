import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { LOCKABLE_APPS } from '../../lib/apps';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

export default function Apps() {
  const { lockedApps } = useOnboarding();
  const toggle = (id: string) =>
    setOnboarding({ lockedApps: lockedApps.includes(id) ? lockedApps.filter((a) => a !== id) : [...lockedApps, id] });
  return (
    <Quiz
      step={9}
      title="Which apps steal your time?"
      subtitle="Pick the ones to lock until you've read. Calls, messages, maps and emergency apps are never blocked."
      ctaDisabled={lockedApps.length === 0}
      cta={lockedApps.length ? `Lock ${lockedApps.length} ${lockedApps.length === 1 ? 'app' : 'apps'}` : 'Choose at least one'}
      onContinue={() => router.push('/onboarding/commitment')}
    >
      {LOCKABLE_APPS.map((a) => (
        <Option key={a.id} label={a.name} selected={lockedApps.includes(a.id)} onPress={() => toggle(a.id)} />
      ))}
    </Quiz>
  );
}
