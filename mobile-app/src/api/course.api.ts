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

export interface StudyPlanDay {
  dayNumber: number;
  date: string;
  topic: string;
  subtopics: string[];
  estimatedMinutes: number;
  status: 'pending' | 'completed';
  content?: string | null;
  keyConcepts?: string[];
  tips?: string[];
}

export interface StudyPlan {
  _id: string;
  course: string;
  totalDays: number;
  days: StudyPlanDay[];
  generationStatus: 'pending' | 'completed' | 'failed';
}

export const createCourseRequest = (payload: CreateCoursePayload) =>
  api.post<{ course: Course }>('/courses', payload).then((r) => r.data.course);

export const getMyCoursesRequest = () =>
  api.get<{ courses: Course[] }>('/courses').then((r) => r.data.courses);

export const getCourseByIdRequest = (id: string) =>
  api.get<{ course: Course }>(`/courses/${id}`).then((r) => r.data.course);

export const deleteCourseRequest = (id: string) => api.delete(`/courses/${id}`);

export const generatePlanRequest = (courseId: string) =>
  api.post<{ plan: StudyPlan }>(`/courses/${courseId}/generate-plan`).then((r) => r.data.plan);

export const getPlanRequest = (courseId: string) =>
  api.get<{ plan: StudyPlan }>(`/courses/${courseId}/plan`).then((r) => r.data.plan);

export const getDayContentRequest = (courseId: string, dayNumber: number) =>
  api.get<{ day: StudyPlanDay }>(`/courses/${courseId}/days/${dayNumber}`).then((r) => r.data.day);

export const markDayCompleteRequest = (courseId: string, dayNumber: number) =>
  api.patch<{ day: StudyPlanDay }>(`/courses/${courseId}/days/${dayNumber}/complete`).then((r) => r.data.day);