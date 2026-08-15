import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { spacing } from '../theme/spacing';

export default function CoursesScreen() {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Your Courses</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Course creation and AI study plans arrive on Day 5–6.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15 },
});