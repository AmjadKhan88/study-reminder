import { api } from './client';

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  _id: string;
  dayNumber: number;
  cards: Flashcard[];
}

export const getFlashcardsRequest = (courseId: string, dayNumber: number) =>
  api
    .get<{ flashcardSet: FlashcardSet }>(`/courses/${courseId}/days/${dayNumber}/flashcards`)
    .then((r) => r.data.flashcardSet);