import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';

export default function StreakBadge({ streak }: { streak: number }) {
  const { theme } = useAppTheme();
  const active = streak > 0;

  return (
    <View style={[styles.badge, { backgroundColor: active ? theme.accent + '22' : theme.surfaceAlt }]}>
      <Ionicons name="flame" size={18} color={active ? theme.accent : theme.textSecondary} />
      <Text style={[styles.text, { color: active ? theme.accent : theme.textSecondary }]}>
        {streak} day{streak === 1 ? '' : 's'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 6,
  },
  text: { fontWeight: '700', fontSize: 13 },
});