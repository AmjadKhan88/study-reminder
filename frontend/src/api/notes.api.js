import api from './axios';

export const uploadNote = (courseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/courses/${courseId}/notes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getNotes = (courseId) => api.get(`/courses/${courseId}/notes`);
export const getNoteById = (courseId, noteId) => api.get(`/courses/${courseId}/notes/${noteId}`);
export const deleteNote = (courseId, noteId) => api.delete(`/courses/${courseId}/notes/${noteId}`);
export const askQuestion = (courseId, question) =>
  api.post(`/courses/${courseId}/notes/ask`, { question });