import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { spacing } from '../theme/spacing';

export default function GoalSettingsScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { user, updateNotificationSettings } = useAuth();
  const [daysGoal, setDaysGoal] = useState(String(user?.weeklyGoalDays ?? 5));
  const [minutesGoal, setMinutesGoal] = useState(String(user?.weeklyGoalMinutes ?? 300));
  const [saving, setSaving] = useState(false);

  const parsedDays = parseInt(daysGoal, 10);
  const parsedMinutes = parseInt(minutesGoal, 10) || 0;
  const canSave = parsedDays >= 1 && parsedDays <= 7;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateNotificationSettings({ weeklyGoalDays: parsedDays, weeklyGoalMinutes: parsedMinutes });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Set a weekly target. Progress resets every Monday and counts any day you mark complete across all your courses.
        </Text>

        <AppTextInput
          label="Study days per week (1-7)"
          value={daysGoal}
          onChangeText={(v) => setDaysGoal(v.replace(/[^0-9]/g, '').slice(0, 1))}
          keyboardType="number-pad"
          placeholder="5"
        />
        <AppTextInput
          label="Study minutes per week (optional, 0 to disable)"
          value={minutesGoal}
          onChangeText={(v) => setMinutesGoal(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder="300"
        />

        <AppButton title="Save Goal" onPress={handleSave} loading={saving} disabled={!canSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { fontSize: 14, marginBottom: spacing.lg },
});