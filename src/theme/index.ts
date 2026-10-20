export const colors = {
  background: '#FAF6EA',
  card: '#F3EEDF',
  cardSelected: '#FBEBB8',
  border: '#E6DDC4',
  primary: '#F5C842',
  gold: '#B8913A',
  green: '#4F7A4A',
  text: '#1A1A1A',
  textSecondary: '#7A7261',
} as const;

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
