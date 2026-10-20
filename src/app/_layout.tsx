import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Lora_400Regular, Lora_600SemiBold } from '@expo-google-fonts/lora';
import { Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { syncNotifications } from '../lib/notifications';
import { loadOnboarding, useOnboarding } from '../lib/onboarding';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, BebasNeue_400Regular, Lora_400Regular, Lora_600SemiBold });

  const [ready, setReady] = useState(false);
  const app = useOnboarding();
  useEffect(() => {
    loadOnboarding().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) syncNotifications(app);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, app.remindersOn, app.completed, app.lockStartHour, app.trialStartedAt, app.lockDays.join()]);

  useEffect(() => {
    if ((loaded || error) && ready) SplashScreen.hideAsync();
  }, [loaded, error, ready]);

  if ((!loaded && !error) || !ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </>
  );
}
