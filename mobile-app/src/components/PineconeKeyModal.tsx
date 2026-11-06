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
  "Open Pinecone (button below) and sign up for the free Starter plan. No card is needed.",
  'In the left menu tap "API keys", then copy the default key (or tap "Create API key").',
  'Come back here, paste it, and tap "Save key". We create the storage index for you. This can take up to a minute.',
];

export default function PineconeKeyModal() {
  const { theme } = useAppTheme();
  const {
    isAuthenticated,
    pineconeModalOpen,
    closePineconeModal,
    savePineconeKey,
  } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await savePineconeKey(apiKey.trim());
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
      visible={isAuthenticated && pineconeModalOpen}
      animationType="slide"
      onRequestClose={closePineconeModal}
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
            Connect your Pinecone
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Lecture notes are stored in your own free Pinecone account so the AI
            can answer questions from them.
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
            title="Open Pinecone"
            variant="secondary"
            onPress={() => Linking.openURL("https://app.pinecone.io")}
            style={{ marginVertical: spacing.md }}
          />

          <AppTextInput
            label="Pinecone API key"
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
            title={saving ? "Connecting..." : "Save key"}
            onPress={handleSave}
            loading={saving}
            disabled={apiKey.trim().length < 20}
          />

          <Text style={[styles.note, { color: theme.textSecondary }]}>
            🔒 Your key is stored encrypted and used only to save and search
            your own notes. You can remove it anytime in Account Settings.
          </Text>

          <Text
            style={[styles.skip, { color: theme.textSecondary }]}
            onPress={closePineconeModal}
          >
            Not now
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
