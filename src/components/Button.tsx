import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = { label: string; onPress?: () => void; disabled?: boolean; variant?: 'primary' | 'soft' | 'done' };

// Yellow button, black label centred both ways. `soft` is for secondary actions.
export function Button({ label, onPress, disabled, variant = 'primary' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'soft' && styles.soft,
        variant === 'done' && styles.done,
        disabled && variant === 'primary' && styles.disabled,
        disabled && variant === 'soft' && styles.softDisabled,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.label, variant === 'done' && { color: '#FFFFFF' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    height: 58,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: { backgroundColor: colors.card },
  softDisabled: { opacity: 0.45 },
  done: { backgroundColor: colors.green },
  disabled: { opacity: 0.4 },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
