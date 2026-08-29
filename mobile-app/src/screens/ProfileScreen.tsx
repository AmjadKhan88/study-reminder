import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';

function timeStringToDate(time: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatTimeLabel(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

export default function ProfileScreen({ navigation }: any) {
  const { theme, mode, setMode } = useAppTheme();
  const { user, logout, updateNotificationSettings } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleToggleNotifications = async (value: boolean) => {
    setSaving(true);
    try {
      await updateNotificationSettings({ notificationsEnabled: value });
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // iOS picker stays open until dismissed; Android closes itself
    if (!selectedDate) return;
    const newTime = dateToTimeString(selectedDate);
    setSaving(true);
    try {
      await updateNotificationSettings({ reminderTime: newTime });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{user.name}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{user.email}</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.row}>
          <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '500' }}>Daily reminders</Text>
          <Switch
            value={user.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={saving}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {user.notificationsEnabled && (
          <Pressable style={styles.row} onPress={() => setShowPicker(true)} disabled={saving}>
            <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '500' }}>Reminder time</Text>
            <Text style={{ color: theme.primary, fontSize: 15, fontWeight: '600' }}>
              {formatTimeLabel(user.reminderTime)}
            </Text>
          </Pressable>
        )}

        {showPicker && (
          <DateTimePicker
            value={timeStringToDate(user.reminderTime)}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        <AppButton
          title="Account Settings"
          variant="secondary"
          onPress={() => navigation.navigate('AccountSettings')}
        />
        <AppButton
          title={`Theme: ${mode} (tap to change)`}
          variant="secondary"
          onPress={() => setMode(mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark')}
        />
        <AppButton title="Log Out" variant="secondary" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 4, marginBottom: spacing.lg },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
});