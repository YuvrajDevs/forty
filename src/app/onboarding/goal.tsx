import { router } from 'expo-router';
import { Option, Quiz } from '../../components/Quiz';
import { setOnboarding, useOnboarding } from '../../lib/onboarding';
import { summarize } from '../../lib/plan';
import { chaptersFor, SCOPES } from '../../lib/scopes';

const hoursLabel = (minutes: number) => {
  const h = minutes / 60;
  return h < 10 ? `about ${h.toFixed(1)} hours` : `about ${Math.round(h)} hours`;
};

export default function Goal() {
  const { scope } = useOnboarding();
  return (
    <Quiz step={7} title="What do you want to read?" subtitle="You can change this later." onContinue={() => router.push('/onboarding/days')}>
      {SCOPES.map((o) => {
        const chapters = chaptersFor(o.id);
        return (
          <Option
            key={o.id}
            label={o.title}
            hint={`${chapters.length.toLocaleString('en-US')} chapters · ${hoursLabel(summarize(chapters, 1).totalMinutes)}`}
            selected={scope === o.id}
            onPress={() => setOnboarding({ scope: o.id })}
          />
        );
      })}
    </Quiz>
  );
}
