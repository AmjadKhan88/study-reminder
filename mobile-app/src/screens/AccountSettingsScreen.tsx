import React, { useState } from "react";
import { Linking } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import { changePasswordRequest, deleteAccountRequest } from "../api/auth.api";
import { spacing, radius } from "../theme/spacing";

export default function AccountSettingsScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const {
    user,
    logout,
    openKeyModal,
    removeGeminiKey,
    openPineconeModal,
    removePineconeKey,
  } = useAuth();

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete account
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const passwordMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canChangePassword =
    currentPassword.length > 0 && newPassword.length >= 8 && !passwordMismatch;

  const handleChangePassword = async () => {
    setPasswordError(null);
    setChangingPassword(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      Alert.alert(
        "Password changed",
        "Please log in again with your new password.",
        [{ text: "OK", onPress: logout }],
      );
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message || "Could not change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRemoveKey = () => {
    Alert.alert(
      "Remove API key?",
      "AI features will stop working until you add a new key.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removeGeminiKey().catch(() =>
              Alert.alert("Error", "Could not remove key."),
            ),
        },
      ],
    );
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      await deleteAccountRequest(deletePassword);
      Alert.alert(
        "Account deleted",
        "Your account and all data have been permanently removed.",
        [{ text: "OK", onPress: logout }],
      );
    } catch (err: any) {
      Alert.alert(
        "Could not delete account",
        err.response?.data?.message || "Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRemovePinecone = () => {
    Alert.alert(
      "Remove Pinecone key?",
      "Note search and Ask AI stop working until you add a key again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            removePineconeKey().catch(() =>
              Alert.alert("Error", "Could not remove key."),
            ),
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Gemini API Key
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            { color: user?.hasGeminiKey ? theme.success : theme.danger },
          ]}
        >
          {user?.hasGeminiKey
            ? "✓ Your key is saved and active."
            : "No key added. AI features are disabled."}
        </Text>
        <AppButton
          title={user?.hasGeminiKey ? "Replace API Key" : "Add API Key"}
          variant="secondary"
          onPress={openKeyModal}
        />
        {user?.hasGeminiKey && (
          <AppButton
            title="Remove API Key"
            variant="secondary"
            onPress={handleRemoveKey}
            style={{ marginTop: spacing.sm, borderColor: theme.danger }}
          />
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Pinecone API Key (Lecture Notes)
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            {
              color: user?.hasPineconeKey ? theme.success : theme.textSecondary,
            },
          ]}
        >
          {user?.hasPineconeKey
            ? "✓ Connected. Your notes are stored in your own Pinecone."
            : "Not connected. Needed only if you upload lecture notes."}
        </Text>
        <AppButton
          title={
            user?.hasPineconeKey ? "Replace Pinecone Key" : "Add Pinecone Key"
          }
          variant="secondary"
          onPress={openPineconeModal}
        />
        {user?.hasPineconeKey && (
          <AppButton
            title="Remove Pinecone Key"
            variant="secondary"
            onPress={handleRemovePinecone}
            style={{ marginTop: spacing.sm, borderColor: theme.danger }}
          />
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Change Password
        </Text>
        <AppTextInput
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="••••••••"
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
        {!!passwordError && (
          <Text
            style={{
              color: theme.danger,
              fontSize: 14,
              marginBottom: spacing.md,
            }}
          >
            {passwordError}
          </Text>
        )}
        <AppButton
          title="Change Password"
          variant="secondary"
          onPress={handleChangePassword}
          loading={changingPassword}
          disabled={!canChangePassword}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={[styles.dangerZone, { borderColor: theme.danger }]}>
          <Text style={[styles.sectionTitle, { color: theme.danger }]}>
            Delete Account
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            This permanently deletes your account, courses, study plans, notes,
            and all associated data. This cannot be undone.
          </Text>

          {!showDeleteConfirm ? (
            <AppButton
              title="Delete My Account"
              variant="secondary"
              onPress={() => setShowDeleteConfirm(true)}
              style={{ borderColor: theme.danger }}
            />
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
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setShowDeleteConfirm(false)}
                style={{ marginTop: spacing.sm }}
              />
            </>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Legal
        </Text>
        <AppButton
          title="Privacy Policy"
          variant="secondary"
          onPress={() =>
            Linking.openURL(
              "https://studypilot-api-7ka1.onrender.com/privacy.html",
            )
          }
          style={{ marginBottom: spacing.sm }}
        />
        <AppButton
          title="Terms of Service"
          variant="secondary"
          onPress={() =>
            Linking.openURL(
              "https://studypilot-api-7ka1.onrender.com/terms.html",
            )
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: spacing.md },
  divider: { height: 1, marginVertical: spacing.xl },
  dangerZone: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
