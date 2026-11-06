import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import {
  getFlashcardsRequest,
  reviewFlashcardRequest,
  FlashcardSet,
  ReviewRating,
} from "../api/flashcard.api";
import AppButton from "../components/AppButton";
import { spacing, radius } from "../theme/spacing";

export default function FlashcardsScreen({ route, navigation }: any) {
  const { courseId, dayNumber, topic } = route.params;
  const { theme } = useAppTheme();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rating, setRating] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

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

  const RATINGS: { key: ReviewRating; label: string; color: string }[] = [
    { key: "again", label: "Again", color: theme.danger },
    { key: "hard", label: "Hard", color: theme.accent },
    { key: "good", label: "Good", color: theme.success },
    { key: "easy", label: "Easy", color: theme.primary },
  ];

  const handleRate = async (key: ReviewRating) => {
    if (!set || rating) return;
    setRating(true);
    try {
      await reviewFlashcardRequest(
        courseId,
        dayNumber,
        set.cards[index]._id,
        key,
      );
      setReviewedCount((c) => c + 1);
      setFlipped(false);
      if (index < set.cards.length - 1) setIndex((i) => i + 1);
    } catch {
      Alert.alert("Error", "Could not save your review. Please try again.");
    } finally {
      setRating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Building your flashcards...
        </Text>
      </View>
    );
  }

  if (!set || set.cards.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>
          No flashcards available.
        </Text>
      </View>
    );
  }

  if (reviewedCount >= set.cards.length) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text
          style={{
            color: theme.textPrimary,
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 6,
          }}
        >
          All caught up! 🎉
        </Text>
        <Text
          style={{
            color: theme.textSecondary,
            textAlign: "center",
            marginBottom: spacing.lg,
          }}
        >
          You reviewed {set.cards.length} cards. They'll come back when they're
          due.
        </Text>
        <AppButton
          title="Take the Quiz"
          onPress={() =>
            navigation.replace("Quiz", { courseId, dayNumber, topic })
          }
        />
        <AppButton
          title="Back to Day"
          variant="secondary"
          style={{ marginTop: spacing.sm }}
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const card = set.cards[index];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.progress, { color: theme.textSecondary }]}>
        {index + 1} / {set.cards.length}
      </Text>

      <Pressable
        onPress={() => setFlipped((f) => !f)}
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>
          {flipped ? "ANSWER" : "QUESTION"}
        </Text>
        <Text style={[styles.cardText, { color: theme.textPrimary }]}>
          {flipped ? card.back : card.front}
        </Text>
        <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
          {flipped ? "How well did you know this?" : "Tap to reveal"}
        </Text>
      </Pressable>

      {flipped && (
        <View style={styles.ratingsRow}>
          {RATINGS.map((r) => (
            <Pressable
              key={r.key}
              onPress={() => handleRate(r.key)}
              disabled={rating}
              style={[
                styles.ratingBtn,
                { borderColor: r.color, opacity: rating ? 0.5 : 1 },
              ]}
            >
              <Text style={{ color: r.color, fontWeight: "700", fontSize: 13 }}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: { marginTop: spacing.md, fontSize: 14 },
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  progress: { textAlign: "center", marginBottom: spacing.md, fontSize: 13 },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  tapHint: { fontSize: 12, marginTop: spacing.lg },
  ratingsRow: { flexDirection: "row", gap: spacing.sm },
  ratingBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
});
