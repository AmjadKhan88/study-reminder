import api from './axios';

export const getSummary = () => api.get('/stats/summary');
export const getWeeklyGoal = () => api.get('/stats/weekly-goal');
export const getWeakTopics = () => api.get('/stats/weak-topics');