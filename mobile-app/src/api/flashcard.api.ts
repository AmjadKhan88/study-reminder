import { api } from "./client";

export interface Flashcard {
  _id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  _id: string;
  dayNumber: number;
  cards: Flashcard[];
}

export type ReviewRating = "again" | "hard" | "good" | "easy";

export const getFlashcardsRequest = (courseId: string, dayNumber: number) =>
  api
    .get<{
      flashcardSet: FlashcardSet;
    }>(`/courses/${courseId}/days/${dayNumber}/flashcards`)
    .then((r: any) => r.data.flashcardSet);

export const reviewFlashcardRequest = (
  courseId: string,
  dayNumber: number,
  cardId: string,
  rating: ReviewRating,
) =>
  api
    .post(
      `/courses/${courseId}/days/${dayNumber}/flashcards/${cardId}/review`,
      { rating },
    )
    .then((r: any) => r.data.card);
