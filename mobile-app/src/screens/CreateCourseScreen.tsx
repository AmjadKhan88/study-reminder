import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AppDropdown from '../components/AppDropdown';
import { createCourseRequest, generatePlanRequest, AIProvider, DurationUnit } from '../api/course.api';
import { spacing } from '../theme/spacing';

const AI_PROVIDER_OPTIONS = [
  { label: 'Gemini', value: 'gemini' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Groq', value: 'groq' },
];

const DURATION_UNIT_OPTIONS = [
  { label: 'Weeks', value: 'weeks' },
  { label: 'Months', value: 'months' },
];

export default function CreateCourseScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState('');
  const [durationValue, setDurationValue] = useState('6');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('months');
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Create Course');
  const [error, setError] = useState<string | null>(null);

  const parsedDuration = parseInt(durationValue, 10);
  const canSubmit = title.trim().length > 2 && outline.trim().length > 20 && !!parsedDuration && parsedDuration > 0;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      setStatusMessage('Creating course...');
      const course = await createCourseRequest({
        title: title.trim(),
        outline: outline.trim(),
        durationValue: parsedDuration,
        durationUnit,
        aiProvider,
      });

      setStatusMessage('Generating your study plan (this can take up to 20s)...');
      await generatePlanRequest(course._id);

      navigation.replace('CourseDetail', { courseId: course._id, courseTitle: course.title });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not create course. Please try again.');
    } finally {
      setSubmitting(false);
      setStatusMessage('Create Course');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Paste your course outline or syllabus — the AI will turn it into a day-wise study plan.
        </Text>

        <AppTextInput label="Course title" value={title} onChangeText={setTitle} placeholder="e.g. Discrete Structures" />

        <AppTextInput
          label="Course outline / syllabus"
          value={outline}
          onChangeText={setOutline}
          placeholder="Paste your syllabus, topic list, or lecture outline here..."
          multiline
          numberOfLines={8}
          style={{ height: 160, textAlignVertical: 'top', paddingTop: 12 }}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <AppTextInput
              label="Duration"
              value={durationValue}
              onChangeText={(v) => setDurationValue(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="6"
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <AppDropdown label="Unit" value={durationUnit} options={DURATION_UNIT_OPTIONS} onChange={(v) => setDurationUnit(v as DurationUnit)} />
          </View>
        </View>

        <AppDropdown label="AI provider" value={aiProvider} options={AI_PROVIDER_OPTIONS} onChange={(v) => setAiProvider(v as AIProvider)} />

        {submitting && (
          <Text style={[styles.status, { color: theme.textSecondary }]}>{statusMessage}</Text>
        )}
        {!!error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}

        <AppButton title="Create Course" onPress={handleSubmit} loading={submitting} disabled={!canSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { fontSize: 14, marginBottom: spacing.lg },
  row: { flexDirection: 'row' },
  status: { fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
  error: { fontSize: 14, marginBottom: spacing.md },
});