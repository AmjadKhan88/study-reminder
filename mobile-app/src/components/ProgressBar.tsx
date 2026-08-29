import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius } from '../theme/spacing';

export default function ProgressBar({ percentage, color }: { percentage: number; color?: string }) {
  const { theme } = useAppTheme();
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color || theme.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});