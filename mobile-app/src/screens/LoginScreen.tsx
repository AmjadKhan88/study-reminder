import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { spacing } from '../theme/spacing';

export default function LoginScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    clearError();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch {
      // error already set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Log in to continue your study plan
        </Text>

        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <AppTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        {!!error && <Text style={[styles.errorBanner, { color: theme.danger }]}>{error}</Text>}

        <AppButton title="Log In" onPress={handleLogin} loading={submitting} disabled={!email || !password} />

        <View style={styles.footerRow}>
          <Text style={{ color: theme.textSecondary }}>Don't have an account? </Text>
          <Text style={{ color: theme.primary, fontWeight: '600' }} onPress={() => navigation.navigate('Register')}>
            Sign up
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: spacing.xl },
  errorBanner: { marginBottom: spacing.md, fontSize: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});