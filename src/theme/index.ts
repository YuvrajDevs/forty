import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useOnboarding } from '../lib/onboarding';

export type Palette = {
  dark: boolean;
  background: string;
  card: string;
  cardSelected: string;
  border: string;
  /** Yellow for primary actions. */
  primary: string;
  /** Text and icons that sit on top of the primary yellow. */
  onPrimary: string;
  gold: string;
  /** Logo blue, for small accents like switches. */
  accent: string;
  green: string;
  /** Text and ticks that sit on top of the green. */
  onGreen: string;
  text: string;
  textSecondary: string;
  radioBorder: string;
  /** Soft green panel (progress stat). */
  tintGreen: string;
  danger: string;
  dangerBg: string;
  /** Dimmer behind popups and sheets. */
  backdrop: string;
  /** Verse highlight colours. */
  highlight: { gold: string; green: string; rose: string };
  /** Light wash for the verse being read aloud or jumped to. */
  wash: string;
  washStrong: string;
  /** A calendar day that was missed. */
  missed: string;
};

export const lightColors: Palette = {
  dark: false,
  background: '#FAF6EA',
  card: '#F3EEDF',
  cardSelected: '#FBEBB8',
  border: '#E6DDC4',
  primary: '#F5C842',
  onPrimary: '#1A1A1A',
  gold: '#B8913A',
  accent: '#1E9BFF',
  green: '#4F7A4A',
  onGreen: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#7A7261',
  radioBorder: '#BDB398',
  tintGreen: '#E3EBDD',
  danger: '#B3261E',
  dangerBg: '#FBE4E0',
  backdrop: 'rgba(26,26,26,0.4)',
  highlight: { gold: '#F6E3A1', green: '#D6E6CE', rose: '#F4D5D0' },
  wash: 'rgba(245, 200, 66, 0.22)',
  washStrong: 'rgba(245, 200, 66, 0.5)',
  missed: '#EFE9D8',
};

export const darkColors: Palette = {
  dark: true,
  background: '#15120D',
  card: '#211D16',
  cardSelected: '#3B3115',
  border: '#352F23',
  primary: '#F5C842',
  onPrimary: '#1A1A1A',
  gold: '#D9B45F',
  accent: '#4DB0FF',
  green: '#86B87E',
  onGreen: '#15120D',
  text: '#F3EEDF',
  textSecondary: '#A8A08C',
  radioBorder: '#6E6551',
  tintGreen: '#24301F',
  danger: '#F2877F',
  dangerBg: '#3A1F1B',
  backdrop: 'rgba(0,0,0,0.62)',
  highlight: { gold: '#5C4B18', green: '#2F4529', rose: '#563029' },
  wash: 'rgba(245, 200, 66, 0.16)',
  washStrong: 'rgba(245, 200, 66, 0.34)',
  missed: '#2B261C',
};

export type ThemeChoice = 'system' | 'light' | 'dark';

/** The colours for the current theme: the person's choice, or the phone's setting. */
export function useColors(): Palette {
  const choice = useOnboarding().theme;
  const scheme = useColorScheme();
  const dark = choice === 'dark' || (choice === 'system' && scheme === 'dark');
  return dark ? darkColors : lightColors;
}

/** Builds a screen's styles from the current palette, rebuilding only when the theme changes. */
export function useStyles<T>(factory: (c: Palette) => T): T {
  const c = useColors();
  return useMemo(() => factory(c), [factory, c]);
}

// Bebas Neue for headings, Outfit for everything else.
export const fonts = {
  light: 'Outfit_300Light',
  body: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  display: 'BebasNeue_400Regular',
  scripture: 'Lora_400Regular',
  scriptureBold: 'Lora_600SemiBold',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { card: 22, button: 28 } as const;
