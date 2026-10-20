import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOOKS } from '../../data/books';
import { useOnboarding } from '../../lib/onboarding';
import { colors, fonts, radius, spacing } from '../../theme';

export default function Read() {
  const [testament, setTestament] = useState<'ot' | 'nt'>('nt');
  const [open, setOpen] = useState<string | null>(null);
  const { readChapters } = useOnboarding();
  const readSet = new Set(readChapters);
  const books = BOOKS.filter((b) => b.testament === testament);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>FORTYBIBLE</Text>
        <Text style={styles.title}>Read</Text>
        <Text style={styles.sub}>World English Bible, offline. Reading here is for you and doesn't change your plan.</Text>

        <View style={styles.seg}>
          {(['nt', 'ot'] as const).map((t) => (
            <Pressable key={t} onPress={() => { setTestament(t); setOpen(null); }} style={[styles.segItem, testament === t && styles.segOn]}>
              <Text style={styles.segText}>{t === 'nt' ? 'New Testament' : 'Old Testament'}</Text>
            </Pressable>
          ))}
        </View>

        {books.map((b) => {
          const isOpen = open === b.id;
          return (
            <View key={b.id} style={styles.book}>
              <Pressable onPress={() => setOpen(isOpen ? null : b.id)} style={styles.bookRow}>
                <Text style={styles.bookName}>{b.name}</Text>
                <Text style={styles.bookMeta}>{b.words.filter((_, i) => readSet.has(`${b.id}:${i + 1}`)).length}/{b.words.length} read</Text>
              </Pressable>
              {isOpen ? (
                <View style={styles.chapters}>
                  {b.words.map((_, i) => {
                    const isRead = readSet.has(`${b.id}:${i + 1}`);
                    return (
                      <Pressable key={i} onPress={() => router.push(`/reader?mode=free&book=${b.id}&chapter=${i + 1}`)} style={[styles.chapter, isRead && styles.chapterRead]}>
                        <Text style={[styles.chapterText, isRead && styles.chapterTextRead]}>{i + 1}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 2, color: colors.textSecondary },
  title: { marginTop: spacing.md, fontFamily: fonts.display, includeFontPadding: false, fontSize: 64, lineHeight: 64, color: colors.text },
  sub: { marginTop: 6, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  seg: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.button, padding: 4, marginVertical: spacing.lg },
  segItem: { flex: 1, height: 44, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.primary },
  segText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  book: { backgroundColor: colors.card, borderRadius: radius.card, marginBottom: 10, overflow: 'hidden' },
  bookRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  bookName: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  bookMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  chapters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 16 },
  chapter: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  chapterRead: { backgroundColor: colors.green },
  chapterTextRead: { color: '#FFFFFF' },
  chapterText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
});
