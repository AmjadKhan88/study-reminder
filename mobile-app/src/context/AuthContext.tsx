import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { tokenStore } from '../api/tokenStore';
import { REFRESH_TOKEN_KEY } from '../utils/constants';
import { registerRequest, loginRequest, logoutRequest, meRequest, AuthUser, AuthResponse } from '../api/auth.api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On app start: if a refresh token exists, try to restore the session.
  // meRequest() will get a 401 (no access token yet), the response
  // interceptor auto-refreshes using the stored token, then retries.
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!stored) return;
        const { user: me } = await meRequest();
        setUser(me);
      } catch {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        tokenStore.set(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = async (data: AuthResponse) => {
    tokenStore.set(data.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await loginRequest(email, password);
      await persistSession(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your details and try again.');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const data = await registerRequest(name, email, password);
      await persistSession(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    }
  };

  const logout = async () => {
    const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    try {
      await logoutRequest(stored);
    } catch {
      // ignore network errors on logout — clear local session regardless
    }
    tokenStore.set(null);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, error, login, register, logout, clearError: () => setError(null) }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};