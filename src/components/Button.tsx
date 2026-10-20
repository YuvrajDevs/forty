import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../theme';

export function Button({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  label: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
});
