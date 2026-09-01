import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import ProgressBar from './ProgressBar';
import { WeeklyGoalProgress } from '../api/stats.api';
import { spacing, radius } from '../theme/spacing';

export default function WeeklyGoalCard({ goal, onPress }: { goal: WeeklyGoalProgress; onPress: () => void }) {
  const { theme } = useAppTheme();
  const daysMet = goal.completedDays >= goal.targetDays;

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>This Week's Goal</Text>
        <Ionicons name="settings-outline" size={16} color={theme.textSecondary} />
      </View>

      <View style={styles.row}>
        <View style={styles.metric}>
          <View style={styles.metricHeader}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Study Days</Text>
            <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700' }}>
              {goal.completedDays}/{goal.targetDays}
            </Text>
          </View>
          <ProgressBar percentage={goal.daysPercentage} color={daysMet ? theme.success : theme.primary} />
        </View>
      </View>

      {goal.targetMinutes > 0 && (
        <View style={[styles.row, { marginTop: spacing.md }]}>
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Study Minutes</Text>
              <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700' }}>
                {goal.completedMinutes}/{goal.targetMinutes}
              </Text>
            </View>
            <ProgressBar
              percentage={goal.minutesPercentage}
              color={goal.minutesPercentage >= 100 ? theme.success : theme.accent}
            />
          </View>
        </View>
      )}

      {daysMet && <Text style={[styles.metGoal, { color: theme.success }]}>🎉 Weekly goal reached!</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 15, fontWeight: '700' },
  row: {},
  metric: {},
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metGoal: { fontSize: 13, fontWeight: '600', marginTop: spacing.sm },
});