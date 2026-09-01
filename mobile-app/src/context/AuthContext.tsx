import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { tokenStore } from '../api/tokenStore';
import { REFRESH_TOKEN_KEY } from '../utils/constants';
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  updateProfileRequest,
  savePushTokenRequest,
  AuthUser,
  AuthResponse,
} from '../api/auth.api';
import {
  requestNotificationPermission,
  getExpoPushToken,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../services/notifications';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateNotificationSettings: (updates: Partial<Pick<AuthUser, 'reminderTime' | 'notificationsEnabled' | 'aiProviderPreference' | 'weeklyGoalDays' | 'weeklyGoalMinutes'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Applies the user's saved preference to the device: schedules/cancels the
// local reminder and (best-effort) registers the push token with the backend.
async function syncNotificationsForUser(user: AuthUser) {
  if (!user.notificationsEnabled) {
    await cancelDailyReminder();
    return;
  }
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await scheduleDailyReminder(user.reminderTime);

  const token = await getExpoPushToken();
  if (token) {
    savePushTokenRequest(token).catch(() => {}); // non-critical — local reminder already works regardless
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!stored) return;
        const { user: me } = await meRequest();
        setUser(me);
        syncNotificationsForUser(me);
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
    syncNotificationsForUser(data.user);
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
      // ignore network errors on logout
    }
    await cancelDailyReminder();
    tokenStore.set(null);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    setUser(null);
  };

  const updateNotificationSettings = async (updates: Partial<Pick<AuthUser, 'reminderTime' | 'notificationsEnabled' | 'aiProviderPreference' | 'weeklyGoalDays' | 'weeklyGoalMinutes'>>) => {
    const updated = await updateProfileRequest(updates);
    setUser(updated);
    await syncNotificationsForUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        register,
        logout,
        clearError: () => setError(null),
        updateNotificationSettings,
      }}
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