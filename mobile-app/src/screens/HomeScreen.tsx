import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getProgressSummaryRequest, getWeeklyGoalRequest, ProgressSummary, WeeklyGoalProgress } from '../api/stats.api';
import StreakBadge from '../components/StreakBadge';
import ProgressBar from '../components/ProgressBar';
import WeeklyGoalCard from '../components/WeeklyGoalCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { spacing, radius } from '../theme/spacing';

export default function HomeScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [goal, setGoal] = useState<WeeklyGoalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [summaryData, goalData] = await Promise.all([getProgressSummaryRequest(), getWeeklyGoalRequest()]);
      setSummary(summaryData);
      setGoal(goalData);
    } catch {
      setError("Couldn't load your progress right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goToCourses = () => navigation.getParent()?.navigate('Courses');
  // const goToGoalSettings = () => navigation.getParent()?.navigate('Profile', { screen: 'GoalSettings' });

  // const goToTodayTask = () => {
  //   if (!summary?.todayTask) return;
  //   navigation.getParent()?.navigate('Courses', {
  //     screen: 'DayDetail',
  //     params: { courseId: summary.todayTask.courseId, dayNumber: summary.todayTask.dayNumber },
  //   });
  // };

  const goToGoalSettings = () =>
  navigation.getParent()?.navigate('Profile', { screen: 'GoalSettings', initial: false });

const goToTodayTask = () => {
  console.log('goToTodayTask fired', summary?.todayTask);
  if (!summary?.todayTask) return;
  navigation.getParent()?.navigate('Courses', {
    screen: 'DayDetail',
    params: { courseId: summary.todayTask.courseId, dayNumber: summary.todayTask.dayNumber },
    initial: false,
  });
};

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <ErrorState message={error} onRetry={load} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>Hi, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Let's keep your streak alive.</Text>
        </View>
        {summary && <StreakBadge streak={summary.currentStreak} />}
      </View>

      {goal && <WeeklyGoalCard goal={goal} onPress={goToGoalSettings} />}

      {!summary || summary.courses.length === 0 ? (
        <EmptyState
          icon="rocket-outline"
          title="No active courses yet"
          subtitle="Create a course and let AI build your study plan to get started."
          actionLabel="Create a Course"
          onAction={goToCourses}
        />
      ) : (
        <>
          {summary.todayTask ? (
            <Pressable onPress={goToTodayTask} style={[styles.taskCard, { backgroundColor: theme.primary }]}>
              <Text style={styles.taskLabel}>TODAY'S FOCUS</Text>
              <Text style={styles.taskCourse}>{summary.todayTask.courseTitle}</Text>
              <Text style={styles.taskTopic} numberOfLines={2}>
                {summary.todayTask.topic}
              </Text>
              <View style={styles.taskCta}>
                <Text style={styles.taskCtaText}>Start Studying</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </Pressable>
          ) : (
            <View style={[styles.taskCard, { backgroundColor: theme.success }]}>
              <Text style={styles.taskLabel}>ALL CAUGHT UP</Text>
              <Text style={styles.taskTopic}>You've completed every day across your active courses. 🎉</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Progress</Text>
          <View style={[styles.overallCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.overallRow}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Overall completion</Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{summary.overallCompletionPercentage}%</Text>
            </View>
            <ProgressBar percentage={summary.overallCompletionPercentage} />
          </View>

          {summary.courses.map((c) => (
            <View key={c.courseId} style={[styles.courseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.overallRow}>
                <Text style={{ color: theme.textPrimary, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                  {c.title}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {c.completedDays}/{c.totalDays} days
                </Text>
              </View>
              <ProgressBar percentage={c.percentage} color={c.onTrack ? theme.success : theme.accent} />
              {!c.onTrack && (
                <Text style={{ color: theme.accent, fontSize: 12, marginTop: 4 }}>
                  ⏳ Falling behind schedule — you can catch up!
                </Text>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  taskCard: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg },
  taskLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  taskCourse: { color: '#fff', fontSize: 13, marginBottom: 4, opacity: 0.9 },
  taskTopic: { color: '#fff', fontSize: 19, fontWeight: '700', lineHeight: 25 },
  taskCta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: 6 },
  taskCtaText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.sm },
  overallCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  overallRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  courseCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
});