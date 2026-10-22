import { Pressable, StyleSheet, Text } from 'react-native';
import { fonts, radius, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

type Props = { label: string; onPress?: () => void; disabled?: boolean; variant?: 'primary' | 'soft' | 'done'; compact?: boolean };

// Yellow button, black label centred both ways. `soft` is for secondary actions.
export function Button({ label, onPress, disabled, variant = 'primary', compact }: Props) {
  const styles = useStyles(createStyles);
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        variant === 'soft' && styles.soft,
        variant === 'done' && styles.done,
        disabled && variant === 'primary' && styles.disabled,
        disabled && variant === 'soft' && styles.softDisabled,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.label, compact && styles.compactLabel, variant === 'soft' && styles.softLabel, variant === 'done' && { color: colors.onGreen }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    height: 58,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { height: 54, paddingHorizontal: 6 },
  compactLabel: { fontSize: 16, paddingHorizontal: 0 },
  soft: { backgroundColor: colors.card },
  softDisabled: { opacity: 0.45 },
  softLabel: { color: colors.text },
  done: { backgroundColor: colors.green },
  disabled: { opacity: 0.4 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.onPrimary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
