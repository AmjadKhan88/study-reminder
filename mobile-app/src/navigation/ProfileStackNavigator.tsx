import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import GoalSettingsScreen from '../screens/GoalSettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import { useAppTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
  const { theme } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: 'Account Settings' }} />
      <Stack.Screen name="GoalSettings" component={GoalSettingsScreen} options={{ title: 'Weekly Goal' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Stack.Navigator>
  );
}