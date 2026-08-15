import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAppTheme } from '../context/ThemeContext';
import { getNoteRequest, LectureNote } from '../api/lectureNote.api';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';

export default function NoteDetailScreen({ route, navigation }: any) {
  const { courseId, noteId } = route.params;
  const { theme } = useAppTheme();
  const [note, setNote] = useState<LectureNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNoteRequest(courseId, noteId);
        setNote(data);
        navigation.setOptions({ title: data.title });
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, noteId]);

  if (loading || !note) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {note.originalFilename} · {note.chunkCount} sections indexed
      </Text>
      {note.truncated && (
        <Text style={{ color: theme.accent, fontSize: 12, marginBottom: spacing.md }}>
          ⚠️ This file was very long — only the first portion was processed.
        </Text>
      )}

      <Markdown style={{ body: { color: theme.textPrimary, fontSize: 15, lineHeight: 22 } }}>
        {note.summary || ''}
      </Markdown>

      {!!note.keyConcepts?.length && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>📌 Key Concepts</Text>
          {note.keyConcepts.map((c, i) => (
            <Text key={i} style={{ color: theme.textPrimary, marginBottom: 4 }}>
              • {c}
            </Text>
          ))}
        </View>
      )}

      <AppButton
        title="Ask AI about this note"
        variant="secondary"
        style={{ marginTop: spacing.lg }}
        onPress={() => navigation.navigate('AskNotes', { courseId, noteId, noteTitle: note.title })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  meta: { fontSize: 13, marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
});