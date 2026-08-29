import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { resetPasswordRequest } from '../api/auth.api';
import { spacing } from '../theme/spacing';

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { email } = route.params;
  const { theme } = useAppTheme();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = code.length === 6 && newPassword.length >= 8 && !passwordMismatch;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await resetPasswordRequest(email, code, newPassword);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.textPrimary }]}>Enter your code</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          We sent a 6-digit code to {email}. It expires in 15 minutes.
        </Text>

        <AppTextInput
          label="Reset code"
          value={code}
          onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          placeholder="123456"
        />
        <AppTextInput
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="At least 8 characters"
        />
        <AppTextInput
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          errorText={passwordMismatch ? "Passwords don't match" : undefined}
        />

        {!!error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}

        <AppButton title="Reset Password" onPress={handleSubmit} loading={submitting} disabled={!canSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: spacing.xl },
  error: { fontSize: 14, marginBottom: spacing.md },
});