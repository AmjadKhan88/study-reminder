import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import { spacing } from '../theme/spacing';

export default function ProfileScreen() {
  const { theme, mode, setMode } = useAppTheme();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{user?.name}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{user?.email}</Text>

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
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
  subtitle: { fontSize: 15, marginTop: 4 },
});