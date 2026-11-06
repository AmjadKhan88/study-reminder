import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { tokenStore } from "../api/tokenStore";
import { REFRESH_TOKEN_KEY } from "../utils/constants";
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  updateProfileRequest,
  savePushTokenRequest,
  saveGeminiKeyRequest,
  removeGeminiKeyRequest,
  removePineconeKeyRequest,
  AuthUser,
  AuthResponse,
  savePineconeKeyRequest,
} from "../api/auth.api";
import {
  requestNotificationPermission,
  getExpoPushToken,
  scheduleDailyReminder,
  cancelDailyReminder,
} from "../services/notifications";
import { onKeyProblem, onPineconeProblem } from "../utils/keyEvents";

type ProfileUpdates = Partial<
  Pick<
    AuthUser,
    | "reminderTime"
    | "notificationsEnabled"
    | "aiProviderPreference"
    | "weeklyGoalDays"
    | "weeklyGoalMinutes"
  >
>;

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateNotificationSettings: (updates: ProfileUpdates) => Promise<void>;
  keyModalOpen: boolean;
  openKeyModal: () => void;
  closeKeyModal: () => void;
  saveGeminiKey: (apiKey: string) => Promise<void>;
  removeGeminiKey: () => Promise<void>;
  pineconeModalOpen: boolean;
  openPineconeModal: () => void;
  closePineconeModal: () => void;
  savePineconeKey: (apiKey: string) => Promise<void>;
  removePineconeKey: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function syncNotificationsForUser(user: AuthUser) {
  if (!user.notificationsEnabled) {
    await cancelDailyReminder();
    return;
  }
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await scheduleDailyReminder(user.reminderTime);

  const token = await getExpoPushToken();
  if (token) savePushTokenRequest(token).catch(() => {});
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [pineconeModalOpen, setPineconeModalOpen] = useState(false);

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

  // Open the key box automatically when a logged-in user has no key.
  useEffect(() => {
    if (user && !user.hasGeminiKey) setKeyModalOpen(true);
  }, [user?.id, user?.hasGeminiKey]);

  // Open it when any API call says the key is missing or invalid.
  useEffect(() => onKeyProblem(() => setKeyModalOpen(true)), []);
  useEffect(() => onPineconeProblem(() => setPineconeModalOpen(true)), []);

  const persistSession = async (data: AuthResponse) => {
    tokenStore.set(data.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
    setUser(data.user);
    syncNotificationsForUser(data.user);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await persistSession(await loginRequest(email, password));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your details and try again.",
      );
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      await persistSession(await registerRequest(name, email, password));
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
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
    setKeyModalOpen(false);
    setPineconeModalOpen(false);
    setUser(null);
  };

  const updateNotificationSettings = async (updates: ProfileUpdates) => {
    const updated = await updateProfileRequest(updates);
    setUser(updated);
    await syncNotificationsForUser(updated);
  };

  const saveGeminiKey = async (apiKey: string) => {
    const updated = await saveGeminiKeyRequest(apiKey);
    setUser(updated);
    setKeyModalOpen(false);
  };

  const removeGeminiKey = async () => {
    const updated = await removeGeminiKeyRequest();
    setUser(updated);
  };

  const savePineconeKey = async (apiKey: string) => {
    const updated = await savePineconeKeyRequest(apiKey);
    setUser(updated);
    setPineconeModalOpen(false);
  };

  const removePineconeKey = async () => {
    const updated = await removePineconeKeyRequest();
    setUser(updated);
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
        keyModalOpen,
        openKeyModal: () => setKeyModalOpen(true),
        closeKeyModal: () => setKeyModalOpen(false),
        saveGeminiKey,
        removeGeminiKey,
        pineconeModalOpen,
        openPineconeModal: () => setPineconeModalOpen(true),
        closePineconeModal: () => setPineconeModalOpen(false),
        savePineconeKey,
        removePineconeKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
