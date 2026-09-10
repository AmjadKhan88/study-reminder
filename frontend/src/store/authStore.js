import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),

  setUser: (user) => set({ user }),

  login: (accessToken, user) =>
    set({ accessToken, user, isAuthenticated: true }),

  logout: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));