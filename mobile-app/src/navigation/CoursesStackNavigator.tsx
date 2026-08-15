import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesScreen from '../screens/CoursesScreen';
import CreateCourseScreen from '../screens/CreateCourseScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import { useAppTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function CoursesStackNavigator() {
  const { theme } = useAppTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="CoursesList" component={CoursesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateCourse" component={CreateCourseScreen} options={{ title: 'New Course' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Study Plan' }} />
    </Stack.Navigator>
  );
}