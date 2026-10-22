import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { Button } from '../components/Button';
import { refLabel, verseText } from '../lib/bible';
import { useOnboarding } from '../lib/onboarding';
import { colors, fonts, spacing } from '../theme';

type Look = 'cream' | 'sunrise' | 'ink';
const LOOKS: { id: Look; label: string }[] = [
  { id: 'cream', label: 'Cream' },
  { id: 'sunrise', label: 'Sunrise' },
  { id: 'ink', label: 'Night' },
];

/** A verse as a picture for WhatsApp or Instagram, with the app name. */
export default function Card() {
  const { book = '', chapter = '1', verse = '1' } = useLocalSearchParams<{ book?: string; chapter?: string; verse?: string }>();
  const { translation } = useOnboarding();
  const { width } = useWindowDimensions();
  const [look, setLook] = useState<Look>('cream');
  const [busy, setBusy] = useState(false);
  const shot = useRef<React.ElementRef<typeof ViewShot>>(null);

  const text = verseText(translation, book, Number(chapter), Number(verse));
  const ref = refLabel(translation, book, Number(chapter), Number(verse));
  const w = Math.min(width - 48, 420);
  const h = (w * 5) / 4; // 4:5 suits Instagram and WhatsApp status
  // Longer verses get smaller type so they always fit.
  const fontSize = (text.length < 90 ? 30 : text.length < 170 ? 25 : text.length < 280 ? 21 : 17) * (w / 340);

  const dark = look !== 'cream';
  const ink = dark ? '#FFFFFF' : colors.text;
  const accent = dark ? colors.primary : colors.gold;

  const share = async () => {
    setBusy(true);
    try {
      const uri = await shot.current?.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: ref });
      else Alert.alert('Sharing is not available on this device');
    } catch {
      Alert.alert('Could not make the picture', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const Inner = (
    <View style={[styles.cardInner, { width: w, height: h, padding: w * 0.09 }]}>
      <Text style={[styles.brand, { color: accent, fontSize: w * 0.075 }]}>FORTYBIBLE</Text>
      <View style={styles.verseWrap}>
        <Text style={[styles.verse, { color: ink, fontSize, lineHeight: fontSize * 1.45 }]}>{text}</Text>
        <Text style={[styles.ref, { color: accent, fontSize: w * 0.05 }]}>{ref}</Text>
      </View>
      <Text style={[styles.tag, { color: dark ? 'rgba(255,255,255,0.8)' : colors.textSecondary, fontSize: w * 0.036 }]}>Read the Bible before you scroll.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Verse card</Text>
      </View>

      <View style={styles.stage}>
        <View style={[styles.frame, { width: w, height: h }]}>
        <ViewShot ref={shot} options={{ format: 'png', quality: 1, result: 'tmpfile' }} style={{ width: w, height: h }}>
          {look === 'cream' ? (
            <View style={{ width: w, height: h, backgroundColor: colors.background }}>{Inner}</View>
          ) : look === 'ink' ? (
            <View style={{ width: w, height: h, backgroundColor: colors.text }}>{Inner}</View>
          ) : (
            <ImageBackground source={require('../../assets/images/sunrise.webp')} style={{ width: w, height: h }} resizeMode="cover">
              <View style={{ width: w, height: h, backgroundColor: 'rgba(26,26,26,0.5)' }}>{Inner}</View>
            </ImageBackground>
          )}
        </ViewShot>
        </View>
      </View>

      <View style={styles.looks}>
        {LOOKS.map((l) => (
          <Pressable key={l.id} accessibilityRole="radio" accessibilityState={{ selected: look === l.id }} onPress={() => setLook(l.id)} style={[styles.look, look === l.id && styles.lookOn]}>
            <Text style={styles.lookText}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={busy ? 'One moment…' : 'Share'} disabled={busy || !text} onPress={share} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.lg, height: 56 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.medium, fontSize: 15, color: colors.textSecondary },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cardInner: { justifyContent: 'space-between' },
  brand: { fontFamily: fonts.display, includeFontPadding: false, letterSpacing: 3, textAlign: 'center' },
  verseWrap: { flexShrink: 1, alignItems: 'center' },
  verse: { fontFamily: fonts.scripture, textAlign: 'center' },
  ref: { marginTop: 16, fontFamily: fonts.semibold, textAlign: 'center', letterSpacing: 0.5 },
  tag: { fontFamily: fonts.body, textAlign: 'center' },
  looks: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: spacing.md },
  look: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, backgroundColor: colors.card },
  lookOn: { backgroundColor: colors.primary },
  lookText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
});
