import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { spacing } from '../theme/spacing';

export default function RegisterScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { register, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = name && email && password.length >= 8 && !passwordMismatch;

  const handleRegister = async () => {
    clearError();
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Start building your personalized study plan
        </Text>

        <AppTextInput label="Full name" value={name} onChangeText={setName} placeholder="Ali Khan" />
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
          placeholder="At least 8 characters"
        />
        <AppTextInput
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          errorText={passwordMismatch ? "Passwords don't match" : undefined}
        />

        {!!error && <Text style={[styles.errorBanner, { color: theme.danger }]}>{error}</Text>}

        <AppButton title="Create Account" onPress={handleRegister} loading={submitting} disabled={!canSubmit} />

        <View style={styles.footerRow}>
          <Text style={{ color: theme.textSecondary }}>Already have an account? </Text>
          <Text style={{ color: theme.primary, fontWeight: '600' }} onPress={() => navigation.navigate('Login')}>
            Log in
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