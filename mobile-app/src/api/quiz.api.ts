import { api } from './client';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  _id: string;
  dayNumber: number;
  questions: QuizQuestion[];
  bestScore: number | null;
  attempts: number;
}

export interface QuizSubmitResult {
  score: number;
  correct: number;
  total: number;
  bestScore: number;
}

export const getQuizRequest = (courseId: string, dayNumber: number) =>
  api.get<{ quiz: Quiz }>(`/courses/${courseId}/days/${dayNumber}/quiz`).then((r) => r.data.quiz);

export const submitQuizRequest = (courseId: string, dayNumber: number, answers: (number | null)[]) =>
  api
    .post<QuizSubmitResult>(`/courses/${courseId}/days/${dayNumber}/quiz/submit`, { answers })
    .then((r) => r.data);