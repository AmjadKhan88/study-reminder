import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { spacing } from '../theme/spacing';

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.greeting, { color: theme.textPrimary }]}>Hi, {user?.name?.split(' ')[0]} 👋</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Your study plan for today will show up here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl },
  greeting: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15 },
});