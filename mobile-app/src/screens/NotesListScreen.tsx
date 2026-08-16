import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { getNotesRequest, uploadNoteRequest, deleteNoteRequest, LectureNote } from '../api/lectureNote.api';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const POLL_INTERVAL_MS = 4000;

export default function NotesListScreen({ route, navigation }: any) {
  const { courseId } = route.params;
  const { theme } = useAppTheme();
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const notesRef = useRef<LectureNote[]>([]); // lets the polling interval always read the latest notes without restarting itself

  const load = useCallback(async () => {
    try {
      const data = await getNotesRequest(courseId);
      setNotes(data);
      notesRef.current = data;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // One interval for the entire time this screen is mounted — it decides
  // each tick whether a re-fetch is needed, instead of being torn down and
  // recreated every time `notes` changes (which was silently killing polling
  // after the first tick).
  useEffect(() => {
    const interval = setInterval(() => {
      const hasProcessing = notesRef.current.some((n) => n.status === 'processing');
      if (hasProcessing) load();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const handlePickAndUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    if ((file.size ?? 0) > MAX_FILE_SIZE) {
      Alert.alert('File too large', 'Please choose a file under 20MB.');
      return;
    }

    setUploading(true);
    try {
      await uploadNoteRequest(courseId, {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType || 'application/octet-stream',
        size: file.size ?? 0,
      });
      await load();
    } catch (err: any) {
      Alert.alert('Upload failed', err.response?.data?.message || 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (note: LectureNote) => {
    Alert.alert('Delete note', `Remove "${note.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNoteRequest(courseId, note._id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <AppButton
          title="Ask AI about your notes"
          variant="secondary"
          onPress={() => navigation.navigate('AskNotes', { courseId })}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={theme.primary} />
      ) : notes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No notes yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Upload lecture notes (PDF, DOCX, or TXT, up to 20MB). AI will summarize them and use them to enrich your study plan.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => (
            <NoteRow
              note={item}
              onPress={() => item.status === 'ready' && navigation.navigate('NoteDetail', { courseId, noteId: item._id })}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <View style={styles.footer}>
        <AppButton title="Upload Notes" onPress={handlePickAndUpload} loading={uploading} />
      </View>
    </View>
  );
}

function NoteRow({ note, onPress, onDelete }: { note: LectureNote; onPress: () => void; onDelete: () => void }) {
  const { theme } = useAppTheme();
  const statusConfig: Record<string, { label: string; color: string }> = {
    processing: { label: 'Processing...', color: theme.textSecondary },
    ready: { label: 'Ready', color: theme.success },
    failed: { label: 'Failed', color: theme.danger },
  };
  const status = statusConfig[note.status];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onDelete}
      style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Ionicons name="document-text" size={22} color={theme.primary} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '600' }} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={{ color: status.color, fontSize: 12, marginTop: 2 }}>
          {status.label}
          {note.status === 'ready' ? ` · ${note.chunkCount} sections indexed` : ''}
        </Text>
      </View>
      {note.status === 'processing' && <ActivityIndicator size="small" color={theme.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  footer: { padding: spacing.lg },
});