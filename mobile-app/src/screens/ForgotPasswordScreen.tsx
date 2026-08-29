import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { forgotPasswordRequest } from '../api/auth.api';
import { spacing } from '../theme/spacing';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.textPrimary }]}>Reset your password</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter your account email and we'll send you a 6-digit reset code.
        </Text>

        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          editable={!sent}
        />

        {!!error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
        {sent && (
          <Text style={[styles.success, { color: theme.success }]}>
            If that email is registered, a code is on its way. Check your inbox.
          </Text>
        )}

        {!sent ? (
          <AppButton title="Send Reset Code" onPress={handleSubmit} loading={submitting} disabled={!email.includes('@')} />
        ) : (
          <AppButton title="Enter Code" onPress={() => navigation.navigate('ResetPassword', { email: email.trim() })} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: spacing.xl },
  error: { fontSize: 14, marginBottom: spacing.md },
  success: { fontSize: 14, marginBottom: spacing.md },
});