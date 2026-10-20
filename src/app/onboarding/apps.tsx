import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppTile } from '../../components/AppTile';
import { Quiz } from '../../components/Quiz';
import { useApps } from '../../lib/useApps';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';

export default function Apps() {
  const { lockedApps } = useOnboarding();
  const apps = useApps();
  const toggle = (id: string) =>
    setOnboarding({ lockedApps: lockedApps.includes(id) ? lockedApps.filter((a) => a !== id) : [...lockedApps, id] });
  const n = lockedApps.length;
  return (
    <Quiz
      step={9}
      title="Which apps steal your time?"
      subtitle="Pick the ones to lock until you've read. Calls, messages, maps and emergency apps are never blocked."
      ctaDisabled={n === 0}
      cta={n ? `Lock ${n} ${n === 1 ? 'app' : 'apps'}` : 'Choose at least one'}
      onContinue={() => router.push('/onboarding/commitment')}
    >
      <View style={styles.grid}>
        {apps.map((a) => (
          <AppTile key={a.id} id={a.id} name={a.name} icon={a.icon} selected={lockedApps.includes(a.id)} onPress={() => toggle(a.id)} />
        ))}
      </View>
    </Quiz>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 } });
