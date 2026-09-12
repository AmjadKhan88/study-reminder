import api from './axios';

export const getFlashcards = (courseId, dayNumber) =>
  api.get(`/courses/${courseId}/days/${dayNumber}/flashcards`);

export const reviewFlashcard = (courseId, dayNumber, cardId, rating) =>
  api.post(`/courses/${courseId}/days/${dayNumber}/flashcards/${cardId}/review`, { rating });

export const getDueFlashcards = () => api.get('/flashcards/due');