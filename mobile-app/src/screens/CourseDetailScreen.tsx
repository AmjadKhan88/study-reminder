import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';
import { getPlanRequest, StudyPlan, StudyPlanDay } from '../api/course.api';
import { spacing, radius } from '../theme/spacing';

export default function CourseDetailScreen({ route, navigation }: any) {
  const { courseId, courseTitle } = route.params;
  const { theme } = useAppTheme();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title: courseTitle });
      let cancelled = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getPlanRequest(courseId);
          if (!cancelled) setPlan(data);
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
      renderItem={({ item }) => <DayRow day={item} />}
    />
  );
}

function DayRow({ day }: { day: StudyPlanDay }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.dayRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.dayBadge, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{day.dayNumber}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 15 }}>{day.topic}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
          {day.subtopics.join(' · ')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  dayRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  dayBadge: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});