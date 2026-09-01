import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import AppDropdown from '../components/AppDropdown';
import {
  Course,
  AIProvider,
  updateCourseRequest,
  archiveCourseRequest,
  unarchiveCourseRequest,
  deleteCourseRequest,
  generatePlanRequest,
} from '../api/course.api';
import { spacing, radius } from '../theme/spacing';

const AI_PROVIDER_OPTIONS = [
  { label: 'Gemini', value: 'gemini' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Groq', value: 'groq' },
];

export default function CourseSettingsScreen({ route, navigation }: any) {
  const { course }: { course: Course } = route.params;
  const { theme } = useAppTheme();

  const [title, setTitle] = useState(course.title);
  const [aiProvider, setAiProvider] = useState<AIProvider>(course.aiProvider);
  const [savingTitle, setSavingTitle] = useState(false);
  const [savingProvider, setSavingProvider] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveTitle = async () => {
    if (title.trim().length < 3 || title.trim() === course.title) return;
    setSavingTitle(true);
    try {
      await updateCourseRequest(course._id, { title: title.trim() });
      Alert.alert('Saved', 'Course title updated.');
    } catch {
      Alert.alert('Error', 'Could not update title.');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleProviderChange = async (value: string) => {
    setAiProvider(value as AIProvider);
    setSavingProvider(true);
    try {
      await updateCourseRequest(course._id, { aiProvider: value as AIProvider });
    } finally {
      setSavingProvider(false);
    }
  };

  const handleToggleArchive = async () => {
    setArchiving(true);
    try {
      if (course.archived) await unarchiveCourseRequest(course._id);
      else await archiveCourseRequest(course._id);
      navigation.navigate('CoursesList');
    } catch {
      Alert.alert('Error', 'Could not update course.');
    } finally {
      setArchiving(false);
    }
  };

  const handleRegeneratePlan = () => {
    Alert.alert(
      'Regenerate study plan?',
      'This replaces the current day-wise plan with a new AI-generated one. Any progress, flashcards, and quizzes tied to the old plan will be lost. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            setRegenerating(true);
            try {
              await generatePlanRequest(course._id);
              Alert.alert('Done', 'Your study plan has been regenerated.', [
                { text: 'OK', onPress: () => navigation.navigate('CourseDetail', { courseId: course._id, courseTitle: course.title }) },
              ]);
            } catch {
              Alert.alert('Error', 'Could not regenerate the plan. Please try again.');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete this course?',
      'This permanently deletes the course, its study plan, flashcards, quizzes, and uploaded notes. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteCourseRequest(course._id);
              navigation.navigate('CoursesList');
            } catch {
              Alert.alert('Error', 'Could not delete course.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Course Title</Text>
        <AppTextInput label="Title" value={title} onChangeText={setTitle} placeholder="Course title" />
        <AppButton
          title="Save Title"
          variant="secondary"
          onPress={handleSaveTitle}
          loading={savingTitle}
          disabled={title.trim().length < 3 || title.trim() === course.title}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>AI Provider</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Applies to new content generated from now on for this course.
        </Text>
        <AppDropdown label="AI Provider" value={aiProvider} options={AI_PROVIDER_OPTIONS} onChange={handleProviderChange} />
        {savingProvider && <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Saving...</Text>}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Study Plan</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Regenerate the entire day-wise plan from your course outline. Existing progress will be lost.
        </Text>
        <AppButton title="Regenerate Study Plan" variant="secondary" onPress={handleRegeneratePlan} loading={regenerating} />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {course.archived ? 'Unarchive Course' : 'Archive Course'}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          {course.archived
            ? 'Restore this course to your active courses list.'
            : 'Hide this course from your main list without deleting it. You can restore it anytime.'}
        </Text>
        <AppButton
          title={course.archived ? 'Unarchive' : 'Archive'}
          variant="secondary"
          onPress={handleToggleArchive}
          loading={archiving}
        />

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={[styles.dangerZone, { borderColor: theme.danger }]}>
          <Text style={[styles.sectionTitle, { color: theme.danger }]}>Delete Course</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Permanently deletes this course and everything tied to it. This cannot be undone.
          </Text>
          <AppButton title="Delete Course" onPress={handleDelete} loading={deleting} style={{ backgroundColor: theme.danger }} />
        </View>
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