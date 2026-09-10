import api from './axios';

export const generatePlan = (courseId) => api.post(`/courses/${courseId}/generate-plan`);
export const getPlan = (courseId) => api.get(`/courses/${courseId}/plan`);
export const getCourseProgress = (courseId) => api.get(`/courses/${courseId}/progress`);
export const getDayContent = (courseId, dayNumber) =>
  api.get(`/courses/${courseId}/days/${dayNumber}`);
export const markDayComplete = (courseId, dayNumber) =>
  api.patch(`/courses/${courseId}/days/${dayNumber}/complete`);