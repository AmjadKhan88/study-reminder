import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { tokenStore } from './tokenStore';
import { API_BASE_URL, REFRESH_TOKEN_KEY } from '../utils/constants';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!storedRefreshToken) return null;
  // Use raw axios here, NOT `api` — avoids re-triggering this same interceptor
  const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken: storedRefreshToken,
  });
  return res.data.accessToken as string;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) refreshPromise = refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        if (!newToken) throw new Error('No refresh token available');

        tokenStore.set(newToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        tokenStore.set(null);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);