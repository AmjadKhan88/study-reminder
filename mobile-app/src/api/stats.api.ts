import { api } from './client';

export interface TodayTask {
  courseId: string;
  courseTitle: string;
  dayNumber: number;
  topic: string;
  subtopics: string[];
}

export interface CourseProgressSummary {
  courseId: string;
  title: string;
  totalDays: number;
  completedDays: number;
  percentage: number;
  expectedCompleted: number;
  onTrack: boolean;
}

export interface ProgressSummary {
  currentStreak: number;
  longestStreak: number;
  overallCompletionPercentage: number;
  activeCourseCount: number;
  todayTask: TodayTask | null;
  courses: CourseProgressSummary[];
}

export interface CourseProgress {
  course: { id: string; title: string; status: string };
  totalDays: number;
  completedDays: number;
  percentage: number;
  expectedCompleted: number;
  onTrack: boolean;
}

export interface WeeklyGoalProgress {
  weekStart: string;
  weekEnd: string;
  targetDays: number;
  completedDays: number;
  daysPercentage: number;
  targetMinutes: number;
  completedMinutes: number;
  minutesPercentage: number;
}

export const getProgressSummaryRequest = () => api.get<ProgressSummary>('/stats/summary').then((r) => r.data);

export const getCourseProgressRequest = (courseId: string) =>
  api.get<CourseProgress>(`/courses/${courseId}/progress`).then((r) => r.data);

export const getWeeklyGoalRequest = () => api.get<WeeklyGoalProgress>('/stats/weekly-goal').then((r) => r.data);