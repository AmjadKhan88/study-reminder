import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';
import { Course } from '../api/course.api';

const STATUS_LABEL: Record<Course['status'], string> = {
  draft: 'Draft',
  generating: 'Generating plan...',
  active: 'Active',
  completed: 'Completed',
};

const PROVIDER_LABEL: Record<Course['aiProvider'], string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  groq: 'Groq',
};

export default function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
        {course.title}
      </Text>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {course.durationValue} {course.durationUnit} · {PROVIDER_LABEL[course.aiProvider]}
      </Text>
      <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{STATUS_LABEL[course.status]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  title: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 13, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '500' },
});