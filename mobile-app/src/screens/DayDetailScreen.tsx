import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';
import { getDayContentRequest, markDayCompleteRequest, StudyPlanDay } from '../api/course.api';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';

export default function DayDetailScreen({ route, navigation }: any) {
  const { courseId, dayNumber } = route.params;
  const { theme } = useAppTheme();
  const [day, setDay] = useState<StudyPlanDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDayContentRequest(courseId, dayNumber);
      setDay(data);
      navigation.setOptions({ title: `Day ${dayNumber}` });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load this day\u2019s content.');
    } finally {
      setLoading(false);
    }
  }, [courseId, dayNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await markDayCompleteRequest(courseId, dayNumber);
      setDay(updated);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Preparing today's material...
        </Text>
      </View>
    );
  }

  if (error || !day) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger, textAlign: 'center', paddingHorizontal: spacing.lg }}>
          {error || 'Content unavailable.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.topic, { color: theme.textPrimary }]}>{day.topic}</Text>
      <Text style={[styles.subtopics, { color: theme.textSecondary }]}>{day.subtopics.join(' · ')}</Text>

      <Text style={[styles.content, { color: theme.textPrimary }]}>{day.content}</Text>

      {!!day.keyConcepts?.length && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Key Concepts</Text>
          {day.keyConcepts.map((c, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color={theme.primary} style={{ marginTop: 7 }} />
              <Text style={[styles.bulletText, { color: theme.textPrimary }]}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {!!day.tips?.length && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Study Tips</Text>
          {day.tips.map((t, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="bulb-outline" size={16} color={theme.accent} style={{ marginTop: 2 }} />
              <Text style={[styles.bulletText, { color: theme.textPrimary, marginLeft: 6 }]}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        <AppButton
          title="Flashcards"
          variant="secondary"
          style={{ flex: 1, marginRight: spacing.sm }}
          onPress={() => navigation.navigate('Flashcards', { courseId, dayNumber, topic: day.topic })}
        />
        <AppButton
          title="Quiz"
          variant="secondary"
          style={{ flex: 1, marginLeft: spacing.sm }}
          onPress={() => navigation.navigate('Quiz', { courseId, dayNumber, topic: day.topic })}
        />
      </View>

      <AppButton
        title={day.status === 'completed' ? 'Completed ✓' : 'Mark Day Complete'}
        onPress={handleComplete}
        loading={completing}
        disabled={day.status === 'completed'}
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topic: { fontSize: 22, fontWeight: '700' },
  subtopics: { fontSize: 14, marginTop: 4, marginBottom: spacing.lg },
  content: { fontSize: 15, lineHeight: 23, marginBottom: spacing.lg },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', marginBottom: 6, paddingRight: spacing.sm },
  bulletText: { fontSize: 14, marginLeft: 8, flex: 1, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', marginTop: spacing.md },
});