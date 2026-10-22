import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { booksFor, getSearchIndex, refLabel, translationName } from '../lib/bible';
import { useOnboarding } from '../lib/onboarding';
import { parseReference, searchVerses } from '../lib/search';
import type { Hit } from '../lib/search';
import { fonts, radius, spacing, useColors, useStyles } from '../theme';
import type { Palette } from '../theme';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The verse text with the searched words marked. */
function Snippet({ text, query }: { text: string; query: string }) {
  const styles = useStyles(createStyles);
  const words = query.trim().split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return <Text style={styles.snippet} numberOfLines={3}>{text}</Text>;
  const parts = text.split(new RegExp(`(${words.map(escape).join('|')})`, 'gi'));
  return (
    <Text style={styles.snippet} numberOfLines={3}>
      {parts.map((p, i) => (words.some((w) => w.toLowerCase() === p.toLowerCase()) ? <Text key={i} style={styles.mark}>{p}</Text> : p))}
    </Text>
  );
}

export default function Search() {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { translation } = useOnboarding();
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState<ReturnType<typeof getSearchIndex>>([]);

  // Building the list of verses takes a moment the first time, so do it after the screen shows.
  useEffect(() => {
    setReady(false);
    const id = setTimeout(() => {
      setIndex(getSearchIndex(translation));
      setReady(true);
    }, 30);
    return () => clearTimeout(id);
  }, [translation]);

  useEffect(() => {
    const id = setTimeout(() => setTerm(query), 220);
    return () => clearTimeout(id);
  }, [query]);

  const ref = useMemo(() => parseReference(term, booksFor(translation)), [term, translation]);
  const hits: Hit[] = useMemo(() => (ready && !ref ? searchVerses(index, term) : []), [ready, ref, index, term]);

  const open = (bookId: string, chapter: number, verse?: number) =>
    router.push(`/reader?mode=free&book=${bookId}&chapter=${chapter}${verse ? `&verse=${verse}` : ''}`);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityLabel="Back" hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.field}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="A word, a phrase, or John 3:16"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query ? (
            <Pressable accessibilityLabel="Clear" hitSlop={10} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={hits}
        keyExtractor={(h) => `${h.bookId}:${h.chapter}:${h.verse}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          ref ? (
            <Pressable onPress={() => open(ref.bookId, ref.chapter, ref.verse)} style={styles.goto}>
              <Text style={styles.gotoText}>Go to {booksFor(translation).find((b) => b.id === ref.bookId)?.name} {ref.chapter}{ref.verse ? `:${ref.verse}` : ''}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </Pressable>
          ) : term && ready && hits.length > 0 ? (
            <Text style={styles.count}>{hits.length >= 60 ? 'First 60 matches' : `${hits.length} ${hits.length === 1 ? 'match' : 'matches'}`}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => open(item.bookId, item.chapter, item.verse)} style={styles.row}>
            <Text style={styles.refText}>{refLabel(translation, item.bookId, item.chapter, item.verse)}</Text>
            <Snippet text={item.text} query={term} />
          </Pressable>
        )}
        ListEmptyComponent={
          !ref ? (
            <Text style={styles.empty}>
              {!ready
                ? 'Getting ready…'
                : term.trim().length < 2
                  ? `Search all of ${translationName(translation)}. It works offline.`
                  : `No verses found for “${term.trim()}”.`}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, height: 60 },
  back: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center' },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 16, borderRadius: 23, backgroundColor: colors.card },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.text, paddingVertical: 0 },
  list: { padding: spacing.lg, paddingTop: spacing.md },
  count: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
  goto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cardSelected, borderRadius: radius.card, padding: 18, marginBottom: 12 },
  gotoText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  refText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold, marginBottom: 3 },
  snippet: { fontFamily: fonts.scripture, fontSize: 15, lineHeight: 23, color: colors.text },
  mark: { backgroundColor: colors.washStrong },
  empty: { marginTop: 40, textAlign: 'center', fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.textSecondary, paddingHorizontal: spacing.lg },
});
