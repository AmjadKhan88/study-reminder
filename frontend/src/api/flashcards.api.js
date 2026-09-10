import api from './axios';

export const getFlashcards = (courseId, dayNumber) =>
  api.get(`/courses/${courseId}/days/${dayNumber}/flashcards`);