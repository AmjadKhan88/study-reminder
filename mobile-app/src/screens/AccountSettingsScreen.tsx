import React, { useState } from 'react';
import { Linking } from 'react-native';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AppDropdown from '../components/AppDropdown';
import { changePasswordRequest, deleteAccountRequest } from '../api/auth.api';
import { spacing, radius } from '../theme/spacing';

const AI_PROVIDER_OPTIONS = [
  { label: 'Gemini', value: 'gemini' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Groq', value: 'groq' },
];

export default function AccountSettingsScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { user, logout, updateNotificationSettings } = useAuth();

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // AI provider
  const [aiProvider, setAiProvider] = useState(user?.aiProviderPreference || 'gemini');
  const [savingProvider, setSavingProvider] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canChangePassword = currentPassword.length > 0 && newPassword.length >= 8 && !passwordMismatch;

  const handleChangePassword = async () => {
    setPasswordError(null);
    setChangingPassword(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      Alert.alert('Password changed', 'Please log in again with your new password.', [
        { text: 'OK', onPress: logout },
      ]);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProviderChange = async (value: string) => {
    setAiProvider(value as any);
    setSavingProvider(true);
    try {
      await updateNotificationSettings({ aiProviderPreference: value } as any);
    } finally {
      setSavingProvider(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      await deleteAccountRequest(deletePassword);
      Alert.alert('Account deleted', 'Your account and all data have been permanently removed.', [
        { text: 'OK', onPress: logout },
      ]);
    } catch (err: any) {
      Alert.alert('Could not delete account', err.response?.data?.message || 'Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Default AI Provider</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Used as the default when creating new courses.
        </Text>
        <AppDropdown label="AI Provider" value={aiProvider} options={AI_PROVIDER_OPTIONS} onChange={handleProviderChange} />
        {savingProvider && <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Saving...</Text>}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Change Password</Text>
        <AppTextInput label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••••" />
        <AppTextInput label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="At least 8 characters" />
        <AppTextInput
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
          errorText={passwordMismatch ? "Passwords don't match" : undefined}
        />
        {!!passwordError && <Text style={{ color: theme.danger, fontSize: 14, marginBottom: spacing.md }}>{passwordError}</Text>}
        <AppButton title="Change Password" variant="secondary" onPress={handleChangePassword} loading={changingPassword} disabled={!canChangePassword} />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={[styles.dangerZone, { borderColor: theme.danger }]}>
          <Text style={[styles.sectionTitle, { color: theme.danger }]}>Delete Account</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            This permanently deletes your account, courses, study plans, notes, and all associated data. This cannot be undone.
          </Text>

          {!showDeleteConfirm ? (
            <AppButton title="Delete My Account" variant="secondary" onPress={() => setShowDeleteConfirm(true)} style={{ borderColor: theme.danger }} />
          ) : (
            <>
              <AppTextInput
                label="Enter your password to confirm"
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                placeholder="••••••••"
              />
              <AppButton
                title="Permanently Delete Account"
                onPress={handleDeleteAccount}
                loading={deleting}
                disabled={!deletePassword}
                style={{ backgroundColor: theme.danger }}
              />
              <AppButton title="Cancel" variant="secondary" onPress={() => setShowDeleteConfirm(false)} style={{ marginTop: spacing.sm }} />
            </>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Legal</Text>
        <AppButton
          title="Privacy Policy"
          variant="secondary"
          onPress={() => Linking.openURL('https://studypilot-api-7ka1.onrender.com/privacy.html')}
          style={{ marginBottom: spacing.sm }}
        />
        <AppButton
          title="Terms of Service"
          variant="secondary"
          onPress={() => Linking.openURL('https://studypilot-api-7ka1.onrender.com/terms.html')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: spacing.md },
  divider: { height: 1, marginVertical: spacing.xl },
  dangerZone: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.md },
});