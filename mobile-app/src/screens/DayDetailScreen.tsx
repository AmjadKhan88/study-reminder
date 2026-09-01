import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';
import { getDayContentRequest, markDayCompleteRequest, StudyPlanDay } from '../api/course.api';
import { getSessionsForDayRequest, StudySession } from '../api/session.api';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';
import { Theme } from '../theme/colors';

export default function DayDetailScreen({ route, navigation }: any) {
  const { courseId, dayNumber } = route.params;
  const { theme } = useAppTheme();
  const [day, setDay] = useState<StudyPlanDay | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (regenerate = false) => {
      regenerate ? setRegenerating(true) : setLoading(true);
      setError(null);
      try {
        const data = await getDayContentRequest(courseId, dayNumber, regenerate);
        setDay(data);
        navigation.setOptions({ title: `Day ${dayNumber}` });
      } catch (err: any) {
        setError(err.response?.data?.message || "Could not load this day's content.");
      } finally {
        setLoading(false);
        setRegenerating(false);
      }
    },
    [courseId, dayNumber]
  );

  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessionsForDayRequest(courseId, dayNumber);
      setSessions(data);
    } catch {
      // non-critical — session history is supplementary
    }
  }, [courseId, dayNumber]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh session history whenever this screen regains focus (e.g. after
  // returning from a completed timer session).
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await markDayCompleteRequest(courseId, dayNumber);
      setDay(updated);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Preparing today's material...
        </Text>
      </View>
    );
  }

  if (error || !day) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger, textAlign: 'center', paddingHorizontal: spacing.lg }}>
          {error || 'Content unavailable.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topic, { color: theme.textPrimary }]}>{day.topic}</Text>
          <Text style={[styles.subtopics, { color: theme.textSecondary }]}>{day.subtopics.join(' · ')}</Text>
        </View>
        <Pressable onPress={() => load(true)} disabled={regenerating} style={styles.regenBtn}>
          {regenerating ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Ionicons name="refresh" size={20} color={theme.primary} />
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate('StudySession', {
            courseId,
            dayNumber,
            topic: day.topic,
            estimatedMinutes: day.estimatedMinutes,
          })
        }
        style={[styles.timerCta, { backgroundColor: theme.primary }]}
      >
        <Ionicons name="timer-outline" size={22} color="#fff" />
        <Text style={styles.timerCtaText}>Start Study Session ({day.estimatedMinutes} min)</Text>
      </Pressable>

      <Markdown style={buildMarkdownStyles(theme)}>{day.content || ''}</Markdown>

      {!!day.keyConcepts?.length && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>📌 Key Concepts</Text>
          {day.keyConcepts.map((c, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="ellipse" size={6} color={theme.primary} style={{ marginTop: 7 }} />
              <Text style={[styles.bulletText, { color: theme.textPrimary }]}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {!!day.tips?.length && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>💡 Study Tips</Text>
          {day.tips.map((t, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="bulb-outline" size={16} color={theme.accent} style={{ marginTop: 2 }} />
              <Text style={[styles.bulletText, { color: theme.textPrimary, marginLeft: 6 }]}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      {sessions.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>⏱️ Study Sessions</Text>
          {sessions.map((s) => (
            <View key={s._id} style={styles.sessionRow}>
              <Ionicons
                name={s.completedFully ? 'checkmark-circle' : 'time-outline'}
                size={16}
                color={s.completedFully ? theme.success : theme.textSecondary}
              />
              <Text style={{ color: theme.textPrimary, fontSize: 13, marginLeft: 8, flex: 1 }}>
                {s.actualMinutes} min {s.completedFully ? '· completed' : '· stopped early'}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {new Date(s.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        <AppButton
          title="Flashcards"
          variant="secondary"
          style={{ flex: 1, marginRight: spacing.sm }}
          onPress={() => navigation.navigate('Flashcards', { courseId, dayNumber, topic: day.topic })}
        />
        <AppButton
          title="Quiz"
          variant="secondary"
          style={{ flex: 1, marginLeft: spacing.sm }}
          onPress={() => navigation.navigate('Quiz', { courseId, dayNumber, topic: day.topic })}
        />
      </View>

      <AppButton
        title={day.status === 'completed' ? 'Completed ✓' : 'Mark Day Complete'}
        onPress={handleComplete}
        loading={completing}
        disabled={day.status === 'completed'}
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

function buildMarkdownStyles(theme: Theme) {
  return StyleSheet.create({
    body: { color: theme.textPrimary, fontSize: 15, lineHeight: 23 },
    paragraph: { marginTop: 0, marginBottom: spacing.md },
    heading2: { color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
    strong: { fontWeight: '700', color: theme.textPrimary },
    bullet_list: { marginBottom: spacing.md },
    ordered_list: { marginBottom: spacing.md },
    list_item: { flexDirection: 'row', marginBottom: 6 },
    bullet_list_icon: { color: theme.primary, marginRight: 8, fontSize: 15 },
    ordered_list_icon: { color: theme.primary, marginRight: 8, fontSize: 15 },
    code_inline: { backgroundColor: theme.surfaceAlt, color: theme.accent, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, fontSize: 14 },
    code_block: { backgroundColor: theme.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm },
    fence: { backgroundColor: theme.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm },
    blockquote: { backgroundColor: theme.surfaceAlt, borderLeftWidth: 3, borderLeftColor: theme.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
    hr: { backgroundColor: theme.border, height: 1, marginVertical: spacing.md },
  });
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  regenBtn: { padding: spacing.xs, marginLeft: spacing.sm },
  topic: { fontSize: 22, fontWeight: '700' },
  subtopics: { fontSize: 14, marginTop: 4 },
  timerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
  timerCtaText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, marginTop: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', marginBottom: 6, paddingRight: spacing.sm },
  bulletText: { fontSize: 14, marginLeft: 8, flex: 1, lineHeight: 20 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  actionsRow: { flexDirection: 'row', marginTop: spacing.md },
});