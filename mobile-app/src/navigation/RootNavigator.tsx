import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppTabs from './AppTabs';

const navFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  heavy: { fontFamily: 'System', fontWeight: '900' as const },
};

export default function RootNavigator() {
  const { theme } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();

  const navTheme = {
    dark: theme.mode === 'dark',
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.border,
      notification: theme.accent,
    },
    fonts: navFonts,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}