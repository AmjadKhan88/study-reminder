import { api } from './client';

export interface StudySession {
  _id: string;
  targetMinutes: number;
  actualMinutes: number;
  completedFully: boolean;
  startedAt: string;
  endedAt: string;
  createdAt: string;
}

export interface LogSessionPayload {
  targetMinutes: number;
  actualMinutes: number;
  completedFully: boolean;
  startedAt: string;
  endedAt: string;
}

export const logSessionRequest = (courseId: string, dayNumber: number, payload: LogSessionPayload) =>
  api.post<{ session: StudySession }>(`/courses/${courseId}/days/${dayNumber}/sessions`, payload).then((r) => r.data.session);

export const getSessionsForDayRequest = (courseId: string, dayNumber: number) =>
  api.get<{ sessions: StudySession[] }>(`/courses/${courseId}/days/${dayNumber}/sessions`).then((r) => r.data.sessions);