import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { getPlanRequest, StudyPlan, StudyPlanDay } from '../api/course.api';
import { getCourseProgressRequest, CourseProgress } from '../api/stats.api';
import ProgressBar from '../components/ProgressBar';
import { spacing, radius } from '../theme/spacing';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId, courseTitle } = route.params;
  const { theme } = useAppTheme();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: courseTitle,
        headerRight: () => (
          <Ionicons
            name="document-text-outline"
            size={22}
            color={theme.textPrimary}
            style={{ marginRight: 4 }}
            onPress={() => navigation.navigate('NotesList', { courseId })}
          />
        ),
      });
      let cancelled = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const [planData, progressData] = await Promise.all([
            getPlanRequest(courseId),
            getCourseProgressRequest(courseId),
          ]);
          if (!cancelled) {
            setPlan(planData);
            setProgress(progressData);
          }
        } catch (err: any) {
          if (!cancelled) setError(err.response?.data?.message || 'Could not load study plan');
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [courseId])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading your study plan...</Text>
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger, textAlign: 'center', paddingHorizontal: spacing.lg }}>
          {error || 'No study plan found yet.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: spacing.lg }}
      data={plan.days}
      keyExtractor={(item) => String(item.dayNumber)}
      ListHeaderComponent={
        progress ? (
          <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.progressRow}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                {progress.completedDays} of {progress.totalDays} days complete
              </Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{progress.percentage}%</Text>
            </View>
            <ProgressBar percentage={progress.percentage} color={progress.onTrack ? theme.success : theme.accent} />
            {!progress.onTrack && (
              <Text style={{ color: theme.accent, fontSize: 12, marginTop: 6 }}>
                ⏳ You're a bit behind schedule — no worries, keep going!
              </Text>
            )}
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <DayRow day={item} onPress={() => navigation.navigate('DayDetail', { courseId, dayNumber: item.dayNumber })} />
      )}
    />
  );
}

function DayRow({ day, onPress }: { day: StudyPlanDay; onPress: () => void }) {
  const { theme } = useAppTheme();
  const isCompleted = day.status === 'completed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayRow,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.dayBadge, { backgroundColor: isCompleted ? theme.success : theme.surfaceAlt }]}>
        {isCompleted ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : (
          <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{day.dayNumber}</Text>
        )}
      </View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 15 }}>{day.topic}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
          {day.subtopics.join(' · ')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  progressCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  dayRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  dayBadge: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});