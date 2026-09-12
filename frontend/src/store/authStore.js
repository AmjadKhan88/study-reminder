import { create } from 'zustand';

const REFRESH_KEY = 'sp_refresh_token';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: localStorage.getItem(REFRESH_KEY),
  isAuthenticated: false,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
  setUser: (user) => set({ user }),

  login: (accessToken, user, refreshToken) => {
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    set({ accessToken, user, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(REFRESH_KEY);
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));