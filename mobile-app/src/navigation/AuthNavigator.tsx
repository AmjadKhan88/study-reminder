import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {() => <PlaceholderScreen title="Login (Day 3)" />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {() => <PlaceholderScreen title="Register (Day 3)" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}