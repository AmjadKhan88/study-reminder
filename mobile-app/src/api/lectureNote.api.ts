import { api } from './client';

export type NoteStatus = 'processing' | 'ready' | 'failed';

export interface LectureNote {
  _id: string;
  title: string;
  originalFilename: string;
  fileType: string;
  fileSizeBytes: number;
  dayNumber: number | null;
  status: NoteStatus;
  errorMessage?: string | null;
  summary?: string | null;
  keyConcepts?: string[];
  chunkCount: number;
  createdAt: string;
}

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export const uploadNoteRequest = (courseId: string, file: PickedFile, dayNumber?: number) => {
  const formData = new FormData();
  formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as any);
  if (dayNumber) formData.append('dayNumber', String(dayNumber));

  return api
    .post<{ note: LectureNote }>(`/courses/${courseId}/notes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.note);
};

export const getNotesRequest = (courseId: string) =>
  api.get<{ notes: LectureNote[] }>(`/courses/${courseId}/notes`).then((r) => r.data.notes);

export const getNoteRequest = (courseId: string, noteId: string) =>
  api.get<{ note: LectureNote }>(`/courses/${courseId}/notes/${noteId}`).then((r) => r.data.note);

export const deleteNoteRequest = (courseId: string, noteId: string) =>
  api.delete(`/courses/${courseId}/notes/${noteId}`);

export interface AskAnswer {
  answer: string;
  sources: { noteId: string; score: number }[];
}

export const askNotesRequest = (courseId: string, question: string, noteId?: string) =>
  api.post<AskAnswer>(`/courses/${courseId}/notes/ask`, { question, noteId }).then((r) => r.data);