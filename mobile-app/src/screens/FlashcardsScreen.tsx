import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { getFlashcardsRequest, FlashcardSet } from '../api/flashcard.api';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';

export default function FlashcardsScreen({ route, navigation }: any) {
  const { courseId, dayNumber, topic } = route.params;
  const { theme } = useAppTheme();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `Flashcards · ${topic}` });
    (async () => {
      try {
        const data = await getFlashcardsRequest(courseId, dayNumber);
        setSet(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, dayNumber]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Building your flashcards...</Text>
      </View>
    );
  }

  if (!set || set.cards.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>No flashcards available.</Text>
      </View>
    );
  }

  const card = set.cards[index];

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, set.cards.length - 1));
  };
  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.progress, { color: theme.textSecondary }]}>
        {index + 1} / {set.cards.length}
      </Text>

      <Pressable
        onPress={() => setFlipped((f) => !f)}
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{flipped ? 'ANSWER' : 'QUESTION'}</Text>
        <Text style={[styles.cardText, { color: theme.textPrimary }]}>{flipped ? card.back : card.front}</Text>
        <Text style={[styles.tapHint, { color: theme.textSecondary }]}>Tap to flip</Text>
      </Pressable>

      <View style={styles.navRow}>
        <Pressable onPress={goPrev} disabled={index === 0} style={[styles.navBtn, { opacity: index === 0 ? 0.4 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </Pressable>
        <Pressable
          onPress={goNext}
          disabled={index === set.cards.length - 1}
          style={[styles.navBtn, { opacity: index === set.cards.length - 1 ? 0.4 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <AppButton title="Take the Quiz Instead" variant="secondary" onPress={() => navigation.replace('Quiz', { courseId, dayNumber, topic })} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  progress: { textAlign: 'center', marginBottom: spacing.md, fontSize: 13 },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  cardLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.md },
  cardText: { fontSize: 18, fontWeight: '600', textAlign: 'center', lineHeight: 26 },
  tapHint: { fontSize: 12, marginTop: spacing.lg },
  navRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xl, marginBottom: spacing.lg },
  navBtn: { padding: spacing.sm },
});