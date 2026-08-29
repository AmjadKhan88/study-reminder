import { api } from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  reminderTime: string;
  notificationsEnabled: boolean;
  aiProviderPreference: 'gemini' | 'openai' | 'groq';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const registerRequest = (name: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data);

export const loginRequest = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);

export const logoutRequest = (refreshToken: string | null) => api.post('/auth/logout', { refreshToken });

export const meRequest = () => api.get<{ user: AuthUser }>('/auth/me').then((r) => r.data);

export const updateProfileRequest = (updates: {
  reminderTime?: string;
  notificationsEnabled?: boolean;
  aiProviderPreference?: string;
}) => api.patch<{ user: AuthUser }>('/auth/me', updates).then((r) => r.data.user);

export const savePushTokenRequest = (pushToken: string) => api.post('/auth/push-token', { pushToken });

export const forgotPasswordRequest = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPasswordRequest = (email: string, code: string, newPassword: string) =>
  api.post<{ message: string }>('/auth/reset-password', { email, code, newPassword }).then((r) => r.data);