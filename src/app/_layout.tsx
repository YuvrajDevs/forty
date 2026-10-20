import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Lora_400Regular, Lora_600SemiBold } from '@expo-google-fonts/lora';
import { Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { syncNotifications } from '../lib/notifications';
import { billingAvailable, OFFLINE_GRACE_MS, refreshEntitlement } from '../lib/billing';
import { syncLock } from '../lib/lock';
import { getOnboarding, loadOnboarding, setOnboarding, useOnboarding } from '../lib/onboarding';
import { getToday } from '../lib/progress';
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

  // Ask Google Play whether the subscription is active, at launch and whenever the app comes back.
  useEffect(() => {
    if (!ready || !app.completed || !billingAvailable) return;
    const check = async () => {
      const active = await refreshEntitlement();
      const now = Date.now();
      const cur = getOnboarding();
      if (active !== null) setOnboarding({ entitled: active, entitlementCheckedAt: now });
      else if (cur.entitled && (!cur.entitlementCheckedAt || now - cur.entitlementCheckedAt > OFFLINE_GRACE_MS)) setOnboarding({ entitled: false });
    };
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, [ready, app.completed]);

  useEffect(() => {
    if (ready) syncLock(app, getToday(app));
  }, [ready, app]);

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
