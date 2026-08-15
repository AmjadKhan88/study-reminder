import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { getQuizRequest, submitQuizRequest, Quiz, QuizSubmitResult } from '../api/quiz.api';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';

export default function QuizScreen({ route, navigation }: any) {
  const { courseId, dayNumber, topic } = route.params;
  const { theme } = useAppTheme();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: `Quiz · ${topic}` });
    (async () => {
      try {
        const data = await getQuizRequest(courseId, dayNumber);
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, dayNumber]);

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    if (result) return; // locked after submit
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuizRequest(courseId, dayNumber, answers);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Building your quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>No quiz available.</Text>
      </View>
    );
  }

  const allAnswered = answers.every((a) => a !== null);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      {!!result && (
        <View style={[styles.resultBanner, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Text style={[styles.resultScore, { color: theme.primary }]}>{result.score}%</Text>
          <Text style={{ color: theme.textSecondary }}>
            {result.correct} / {result.total} correct · Best: {result.bestScore}%
          </Text>
        </View>
      )}

      {quiz.questions.map((q, qIndex) => (
        <View key={qIndex} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.question, { color: theme.textPrimary }]}>
            {qIndex + 1}. {q.question}
          </Text>
          {q.options.map((opt, oIndex) => {
            const isSelected = answers[qIndex] === oIndex;
            const isCorrect = result && oIndex === q.correctIndex;
            const isWrongSelected = result && isSelected && oIndex !== q.correctIndex;

            let borderColor = theme.border;
            if (isCorrect) borderColor = theme.success;
            else if (isWrongSelected) borderColor = theme.danger;
            else if (isSelected) borderColor = theme.primary;

            return (
              <Pressable
                key={oIndex}
                onPress={() => selectAnswer(qIndex, oIndex)}
                style={[
                  styles.option,
                  {
                    borderColor,
                    backgroundColor: isSelected && !result ? theme.surfaceAlt : 'transparent',
                  },
                ]}
              >
                <Text style={{ color: theme.textPrimary, flex: 1 }}>{opt}</Text>
                {isCorrect && <Ionicons name="checkmark-circle" size={18} color={theme.success} />}
                {isWrongSelected && <Ionicons name="close-circle" size={18} color={theme.danger} />}
              </Pressable>
            );
          })}
          {!!result && (
            <Text style={[styles.explanation, { color: theme.textSecondary }]}>{q.explanation}</Text>
          )}
        </View>
      ))}

      {!result ? (
        <AppButton title="Submit Quiz" onPress={handleSubmit} loading={submitting} disabled={!allAnswered} />
      ) : (
        <AppButton title="Back to Day" onPress={() => navigation.goBack()} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  resultBanner: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg },
  resultScore: { fontSize: 32, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  question: { fontSize: 15, fontWeight: '600', marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    marginBottom: 8,
  },
  explanation: { fontSize: 13, marginTop: 6, fontStyle: 'italic', lineHeight: 18 },
});