import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { getMyCoursesRequest, Course } from '../api/course.api';
import CourseCard from '../components/CourseCard';
import AppButton from '../components/AppButton';
import { spacing, radius } from '../theme/spacing';
import EmptyState from '../components/EmptyState';

export default function CoursesScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      const data = await getMyCoursesRequest();
      setCourses(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Your Courses</Text>
        <Pressable onPress={() => navigation.navigate('CreateCourse')} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Ionicons name="add" size={22} color={theme.primaryText} />
        </Pressable>
      </View>

      {!loading && courses.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="No courses yet"
          subtitle="Add your first course outline and let AI build your study plan."
          actionLabel="Create Course"
          onAction={() => navigation.navigate('CreateCourse')}
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCourses(); }} />}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item._id, courseTitle: item.title })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700' },
  addButton: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: spacing.md },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 6 },
});