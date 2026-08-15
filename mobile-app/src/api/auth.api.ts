import { api } from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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

export const logoutRequest = (refreshToken: string | null) =>
  api.post('/auth/logout', { refreshToken });

export const meRequest = () =>
  api.get<{ user: AuthUser }>('/auth/me').then((r) => r.data);