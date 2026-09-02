import { api } from './client';

export interface SearchCourseResult {
  id: string;
  title: string;
  status: string;
}

export interface SearchNoteResult {
  id: string;
  courseId: string;
  title: string;
  summarySnippet: string;
}

export interface SearchDayResult {
  courseId: string;
  courseTitle: string;
  dayNumber: number;
  topic: string;
  subtopics: string[];
}

export interface SearchResults {
  courses: SearchCourseResult[];
  notes: SearchNoteResult[];
  days: SearchDayResult[];
}

export const globalSearchRequest = (query: string) =>
  api.get<SearchResults>('/search', { params: { q: query } }).then((r) => r.data);