import api from './axios';

export const createCourse = (data) => api.post('/courses', data);
export const getMyCourses = () => api.get('/courses');
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const updateCourse = (id, data) => api.patch(`/courses/${id}`, data);
export const archiveCourse = (id) => api.patch(`/courses/${id}/archive`);
export const unarchiveCourse = (id) => api.patch(`/courses/${id}/unarchive`);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);