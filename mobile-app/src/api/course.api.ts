import { api } from './client';

export type AIProvider = 'gemini' | 'openai' | 'groq';
export type DurationUnit = 'weeks' | 'months';
export type CourseStatus = 'draft' | 'generating' | 'active' | 'completed';

export interface Course {
  _id: string;
  title: string;
  outline: string;
  durationValue: number;
  durationUnit: DurationUnit;
  startDate: string;
  endDate: string;
  aiProvider: AIProvider;
  status: CourseStatus;
  createdAt: string;
}

export interface CreateCoursePayload {
  title: string;
  outline: string;
  durationValue: number;
  durationUnit: DurationUnit;
  aiProvider: AIProvider;
}

export const createCourseRequest = (payload: CreateCoursePayload) =>
  api.post<{ course: Course }>('/courses', payload).then((r) => r.data.course);

export const getMyCoursesRequest = () =>
  api.get<{ courses: Course[] }>('/courses').then((r) => r.data.courses);

export const getCourseByIdRequest = (id: string) =>
  api.get<{ course: Course }>(`/courses/${id}`).then((r) => r.data.course);

export const deleteCourseRequest = (id: string) => api.delete(`/courses/${id}`);