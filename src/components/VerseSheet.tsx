import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { refLabel, unquote, verseKey, verseText } from '../lib/bible';
import { addCard, removeCard } from '../lib/memory';
import { setOnboarding, useOnboarding } from '../lib/onboarding';
import type { HighlightColor } from '../lib/onboarding';
import { iso } from '../lib/schedule';
import { fonts, radius, spacing, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

type Props = { target: { bookId: string; chapter: number; verse: number } | null; onClose: () => void };

/** What you can do with one verse: highlight, save, memorize, copy or turn into a card. */
export function VerseSheet({ target, onClose }: Props) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const s = useOnboarding();
  const [copied, setCopied] = useState(false);
  if (!target) return <Modal visible={false} transparent />;

  const key = verseKey(target.bookId, target.chapter, target.verse);
  const label = refLabel(s.translation, target.bookId, target.chapter, target.verse);
  const text = verseText(s.translation, target.bookId, target.chapter, target.verse);
  const color = s.highlights[key];
  const saved = s.bookmarks.includes(key);
  const memorized = s.memory.some((c) => c.key === key);

  const setColor = (c: HighlightColor) => {
    const next = { ...s.highlights };
    if (color === c) delete next[key];
    else next[key] = c;
    setOnboarding({ highlights: next });
  };
  const toggleSaved = () => setOnboarding({ bookmarks: saved ? s.bookmarks.filter((b) => b !== key) : [...s.bookmarks, key] });
  const toggleMemory = () => setOnboarding({ memory: memorized ? removeCard(s.memory, key) : addCard(s.memory, key, iso(new Date())) });
  const copy = async () => {
    await Clipboard.setStringAsync(`“${unquote(text)}” ${label}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grab} />
          <Text style={styles.ref}>{label}</Text>
          <Text style={styles.text} numberOfLines={3}>{text}</Text>

          <View style={styles.swatches}>
            {(Object.keys(colors.highlight) as HighlightColor[]).map((c) => (
              <Pressable key={c} accessibilityRole="button" accessibilityLabel={`Highlight ${c}`} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: colors.highlight[c] }, color === c && styles.swatchOn]}>
                {color === c ? <Ionicons name="checkmark" size={18} color={colors.text} /> : null}
              </Pressable>
            ))}
            <Text style={styles.swatchHint}>{color ? 'Tap again to remove' : 'Highlight'}</Text>
          </View>

          <View style={styles.actions}>
            <Action icon={saved ? 'bookmark' : 'bookmark-outline'} label={saved ? 'Saved' : 'Save'} on={saved} onPress={toggleSaved} />
            <Action icon={memorized ? 'albums' : 'albums-outline'} label={memorized ? 'Memorizing' : 'Memorize'} on={memorized} onPress={toggleMemory} />
            <Action
              icon="image-outline"
              label="Card"
              onPress={() => {
                close();
                router.push(`/card?book=${target.bookId}&chapter=${target.chapter}&verse=${target.verse}`);
              }}
            />
            <Action icon="copy-outline" label={copied ? 'Copied' : 'Copy'} onPress={copy} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Action({ icon, label, on, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; on?: boolean; onPress: () => void }) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}>
      <View style={[styles.actionIcon, on && styles.actionIconOn]}>
        <Ionicons name={icon} size={22} color={colors.text} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.lg, paddingBottom: spacing.xl },
  grab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.md },
  ref: { fontFamily: fonts.display, includeFontPadding: false, fontSize: 34, lineHeight: 36, color: colors.text },
  text: { marginTop: 6, fontFamily: fonts.scripture, fontSize: 16, lineHeight: 25, color: colors.textSecondary },
  swatches: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: spacing.lg },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.text },
  swatchHint: { marginLeft: 4, fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  action: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: { width: 54, height: 54, borderRadius: radius.card - 6, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  actionIconOn: { backgroundColor: colors.cardSelected },
  actionLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
});
