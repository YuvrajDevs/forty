import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { APP_ICONS } from '../lib/appIcons';
import { colors, fonts, radius } from '../theme';

// Black glyph on very light brand colours (e.g. Snapchat yellow), white otherwise.
const glyphFor = (hex: string) => {
  const n = parseInt(hex, 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.7 ? '#000000' : '#FFFFFF';
};

export function AppIcon({ id, size = 48 }: { id: string; size?: number }) {
  const icon = APP_ICONS[id];
  if (!icon) return null;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.26, backgroundColor: `#${icon.hex}`, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24">
        <Path d={icon.path} fill={glyphFor(icon.hex)} />
      </Svg>
    </View>
  );
}

export function AppTile({ id, name, selected, onPress }: { id: string; name: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={name}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.tile, selected && styles.tileOn]}
    >
      <AppIcon id={id} />
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      {selected ? (
        <View style={styles.badge}>
          <Text style={styles.tick}>{'✓'}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flexBasis: '31.5%', flexGrow: 0, aspectRatio: 1, backgroundColor: colors.card, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', gap: 10 },
  tileOn: { backgroundColor: colors.cardSelected },
  name: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, paddingHorizontal: 4 },
  badge: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  tick: { color: '#FFFFFF', fontSize: 13, lineHeight: 16, fontFamily: fonts.semibold },
});
