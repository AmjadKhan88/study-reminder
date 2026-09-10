import api from './axios';

export const getQuiz = (courseId, dayNumber) =>
  api.get(`/courses/${courseId}/days/${dayNumber}/quiz`);
export const submitQuiz = (courseId, dayNumber, answers) =>
  api.post(`/courses/${courseId}/days/${dayNumber}/quiz/submit`, { answers });