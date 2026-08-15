import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useAppTheme } from '../context/ThemeContext';
import { askNotesRequest } from '../api/lectureNote.api';
import { spacing, radius } from '../theme/spacing';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function AskNotesScreen({ route }: any) {
  const { courseId, noteId } = route.params;
  const { theme } = useAppTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || asking) return;

    setMessages((prev) => [...prev, { id: Date.now() + '-u', role: 'user', text: question }]);
    setInput('');
    setAsking(true);

    try {
      const res = await askNotesRequest(courseId, question, noteId);
      setMessages((prev) => [...prev, { id: Date.now() + '-a', role: 'assistant', text: res.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + '-a', role: 'assistant', text: "Sorry, I couldn't answer that. Please try again." },
      ]);
    } finally {
      setAsking(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xl }}>
            Ask anything about your uploaded notes for this course.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user'
                ? { backgroundColor: theme.primary, alignSelf: 'flex-end' }
                : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, alignSelf: 'flex-start' },
            ]}
          >
            {item.role === 'user' ? (
              <Text style={{ color: theme.primaryText }}>{item.text}</Text>
            ) : (
              <Markdown style={{ body: { color: theme.textPrimary, fontSize: 14, lineHeight: 20 } }}>{item.text}</Markdown>
            )}
          </View>
        )}
      />
      {asking && <ActivityIndicator style={{ marginBottom: spacing.sm }} color={theme.primary} />}
      <View style={[styles.inputRow, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your notes..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.surfaceAlt }]}
          multiline
        />
        <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="arrow-up" size={20} color={theme.primaryText} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '85%', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, borderTopWidth: 1, gap: spacing.sm },
  input: { flex: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});