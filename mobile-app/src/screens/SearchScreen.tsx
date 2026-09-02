import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { globalSearchRequest, SearchResults } from '../api/search.api';
import { spacing, radius } from '../theme/spacing';

const DEBOUNCE_MS = 400;

export default function SearchScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await globalSearchRequest(query.trim());
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasAnyResults =
    results && (results.courses.length > 0 || results.notes.length > 0 || results.days.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.surfaceAlt }]}>
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses, notes, topics..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary }]}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color={theme.textSecondary} />}
      </View>

      <ScrollView contentContainerStyle={styles.results} keyboardShouldPersistTaps="handled">
        {query.trim().length >= 2 && !loading && !hasAnyResults && (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No results for "{query.trim()}"
          </Text>
        )}

        {!!results?.courses.length && (
          <Section title="Courses" theme={theme}>
            {results.courses.map((c) => (
              <ResultRow
                key={c.id}
                icon="book-outline"
                title={c.title}
                subtitle={c.status}
                theme={theme}
                onPress={() => navigation.navigate('CourseDetail', { courseId: c.id, courseTitle: c.title })}
              />
            ))}
          </Section>
        )}

        {!!results?.days.length && (
          <Section title="Study Plan Days" theme={theme}>
            {results.days.map((d) => (
              <ResultRow
                key={`${d.courseId}-${d.dayNumber}`}
                icon="calendar-outline"
                title={d.topic}
                subtitle={`${d.courseTitle} · Day ${d.dayNumber}`}
                theme={theme}
                onPress={() => navigation.navigate('DayDetail', { courseId: d.courseId, dayNumber: d.dayNumber })}
              />
            ))}
          </Section>
        )}

        {!!results?.notes.length && (
          <Section title="Lecture Notes" theme={theme}>
            {results.notes.map((n) => (
              <ResultRow
                key={n.id}
                icon="document-text-outline"
                title={n.title}
                subtitle={n.summarySnippet || 'No summary available'}
                theme={theme}
                onPress={() => navigation.navigate('NoteDetail', { courseId: n.courseId, noteId: n.id })}
              />
            ))}
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, theme, children }: any) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function ResultRow({ icon, title, subtitle, theme, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Ionicons name={icon} size={20} color={theme.primary} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    height: 46,
  },
  input: { flex: 1, fontSize: 15 },
  results: { padding: spacing.lg, paddingTop: spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  emptyText: { textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
});