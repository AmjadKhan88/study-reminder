import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export default function PlaceholderScreen({ title }: { title: string }) {
  const { theme, mode, setMode } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        StudyPilot — theme test screen
      </Text>
      <Pressable
        onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <Text style={{ color: theme.primaryText, fontWeight: '600' }}>
          Toggle theme (current: {mode})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14 },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 12 },
});