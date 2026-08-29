import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import AppButton from './AppButton';
import { spacing } from '../theme/spacing';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={44} color={theme.danger} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {message || "We couldn't load this. Check your connection and try again."}
      </Text>
      {!!onRetry && (
        <AppButton title="Try Again" variant="secondary" onPress={onRetry} style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: 17, fontWeight: '600', marginTop: spacing.md },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 6 },
});