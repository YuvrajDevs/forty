import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { billingAvailable } from '../../lib/billing';
import { useOnboarding } from '../../lib/onboarding';
import { colors, fonts } from '../../theme';

export default function TabsLayout() {
  const { completed, entitled } = useOnboarding();
  if (!completed) return <Redirect href="/" />;
  // Hard paywall: no active trial or subscription means the paywall. (Preview builds without Play skip this.)
  if (billingAvailable && !entitled) return <Redirect href="/onboarding/paywall" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, height: 64, paddingTop: 6, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="read" options={{ title: 'Read', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
