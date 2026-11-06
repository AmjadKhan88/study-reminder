import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import AppDropdown from "../components/AppDropdown";
import {
  createCourseRequest,
  generatePlanRequest,
  DurationUnit,
  Difficulty,
} from "../api/course.api";
import { spacing, radius } from "../theme/spacing";

const DURATION_UNIT_OPTIONS = [
  { label: "Weeks", value: "weeks" },
  { label: "Months", value: "months" },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  {
    value: "easy",
    label: "Easy",
    desc: "Start from zero. Simple words, small steps.",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "You know the basics. Balanced lessons.",
  },
  {
    value: "difficult",
    label: "Difficult",
    desc: "Strong basics. Deeper, harder problems.",
  },
];

export default function CreateCourseScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { user, openKeyModal } = useAuth();
  const [title, setTitle] = useState("");
  const [outline, setOutline] = useState("");
  const [durationValue, setDurationValue] = useState("6");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("months");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Create Course");
  const [error, setError] = useState<string | null>(null);

  const parsedDuration = parseInt(durationValue, 10);
  const canSubmit =
    title.trim().length > 2 &&
    outline.trim().length > 20 &&
    !!parsedDuration &&
    parsedDuration > 0;

  const handleSubmit = async () => {
    if (!user?.hasGeminiKey) {
      openKeyModal();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      setStatusMessage("Creating course...");
      const course = await createCourseRequest({
        title: title.trim(),
        outline: outline.trim(),
        durationValue: parsedDuration,
        durationUnit,
        difficulty,
      });

      setStatusMessage(
        "Generating your study plan (this can take up to 20s)...",
      );
      await generatePlanRequest(course._id);

      navigation.replace("CourseDetail", {
        courseId: course._id,
        courseTitle: course.title,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Could not create course. Please try again.",
      );
    } finally {
      setSubmitting(false);
      setStatusMessage("Create Course");
    }
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
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Paste your course outline or syllabus — the AI will turn it into a
          day-wise study plan.
        </Text>

        <AppTextInput
          label="Course title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Physics Class 10 — Motion"
        />

        <AppTextInput
          label="Course outline / syllabus"
          value={outline}
          onChangeText={setOutline}
          placeholder="Paste your syllabus, topic list, or lecture outline here..."
          multiline
          numberOfLines={8}
          style={{ height: 160, textAlignVertical: "top", paddingTop: 12 }}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <AppTextInput
              label="Duration"
              value={durationValue}
              onChangeText={(v) => setDurationValue(v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="6"
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <AppDropdown
              label="Unit"
              value={durationUnit}
              options={DURATION_UNIT_OPTIONS}
              onChange={(v) => setDurationUnit(v as DurationUnit)}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Course level
        </Text>
        <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
          {DIFFICULTIES.map((d) => {
            const selected = difficulty === d.value;
            return (
              <Pressable
                key={d.value}
                onPress={() => setDifficulty(d.value)}
                style={[
                  styles.levelCard,
                  {
                    borderColor: selected ? theme.primary : theme.border,
                    backgroundColor: selected
                      ? theme.surfaceAlt
                      : theme.surface,
                  },
                ]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                  {d.label}
                </Text>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {d.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            marginBottom: spacing.md,
          }}
        >
          Lessons always use simple English. Hard words are explained in
          (brackets).
        </Text>

        {submitting && (
          <Text style={[styles.status, { color: theme.textSecondary }]}>
            {statusMessage}
          </Text>
        )}
        {!!error && (
          <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
        )}

        <AppButton
          title="Create Course"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { fontSize: 14, marginBottom: spacing.lg },
  row: { flexDirection: "row" },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  levelCard: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md },
  status: { fontSize: 13, marginBottom: spacing.sm, textAlign: "center" },
  error: { fontSize: 14, marginBottom: spacing.md },
});
