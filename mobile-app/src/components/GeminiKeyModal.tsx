import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AppTextInput from "./AppTextInput";
import AppButton from "./AppButton";
import { spacing } from "../theme/spacing";

const STEPS = [
  "Open Google AI Studio (button below) and sign in with your Google account.",
  'Tap "Create API key". If it asks for a project, choose "Create API key in new project".',
  "Copy the long key that appears (use the copy button).",
  'Come back here, paste it in the box, and tap "Save key".',
];

export default function GeminiKeyModal() {
  const { theme } = useAppTheme();
  const { isAuthenticated, keyModalOpen, closeKeyModal, saveGeminiKey } =
    useAuth();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await saveGeminiKey(apiKey.trim());
      setApiKey("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Could not save the key. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={isAuthenticated && keyModalOpen}
      animationType="slide"
      onRequestClose={closeKeyModal}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Add your Gemini API key
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            StudyPilot uses Google Gemini to create your lessons. Your own free
            key gives you your own daily limit.
          </Text>

          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View
                style={[styles.stepNum, { backgroundColor: theme.primary }]}
              >
                <Text
                  style={{
                    color: theme.primaryText,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textPrimary,
                  flex: 1,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {s}
              </Text>
            </View>
          ))}

          <AppButton
            title="Open Google AI Studio"
            variant="secondary"
            onPress={() =>
              Linking.openURL("https://aistudio.google.com/apikey")
            }
            style={{ marginVertical: spacing.md }}
          />

          <AppTextInput
            label="Gemini API key"
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Paste your key here"
          />
          {!!error && (
            <Text style={{ color: theme.danger, marginBottom: spacing.md }}>
              {error}
            </Text>
          )}

          <AppButton
            title="Save key"
            onPress={handleSave}
            loading={saving}
            disabled={apiKey.trim().length < 20}
          />

          <Text style={[styles.note, { color: theme.textSecondary }]}>
            🔒 Your key is stored encrypted, used only for your own requests,
            and can be removed anytime in Account Settings. The free plan has
            daily limits that reset every day.
          </Text>

          <Text
            style={[styles.skip, { color: theme.textSecondary }]}
            onPress={closeKeyModal}
          >
            Skip for now (AI features won't work until you add a key)
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: spacing.lg, lineHeight: 20 },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: spacing.sm,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  note: { fontSize: 12, marginTop: spacing.lg, lineHeight: 18 },
  skip: {
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.lg,
    textDecorationLine: "underline",
  },
});
