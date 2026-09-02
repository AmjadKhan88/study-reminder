import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { getMyCoursesRequest, Course } from '../api/course.api';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';
import { spacing, radius } from '../theme/spacing';

export default function CoursesScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      const data = await getMyCoursesRequest(showArchived);
      setCourses(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showArchived]);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{showArchived ? 'Archived' : 'Your Courses'}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable onPress={() => navigation.navigate('Search')} style={[styles.iconButton, { backgroundColor: theme.surfaceAlt }]}>
            <Ionicons name="search" size={20} color={theme.textPrimary} />
          </Pressable>
          {!showArchived && (
            <Pressable onPress={() => navigation.navigate('CreateCourse')} style={[styles.addButton, { backgroundColor: theme.primary }]}>
              <Ionicons name="add" size={22} color={theme.primaryText} />
            </Pressable>
          )}
        </View>
      </View>

      <Pressable onPress={() => setShowArchived((v) => !v)} style={styles.toggleRow}>
        <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>
          {showArchived ? '← Back to active courses' : 'View archived courses'}
        </Text>
      </Pressable>

      {!loading && courses.length === 0 ? (
        <EmptyState
          icon={showArchived ? 'archive-outline' : 'book-outline'}
          title={showArchived ? 'No archived courses' : 'No courses yet'}
          subtitle={
            showArchived
              ? "Courses you archive will show up here."
              : 'Add your first course outline and let AI build your study plan.'
          }
          actionLabel={showArchived ? undefined : 'Create Course'}
          onAction={showArchived ? undefined : () => navigation.navigate('CreateCourse')}
        />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: 0 },
  title: { fontSize: 24, fontWeight: '700' },
  addButton: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  iconButton: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});