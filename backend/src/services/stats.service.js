const StudyPlan = require('../models/StudyPlan.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');

function computeCourseProgress(plan) {
  const totalDays = plan.days.length;
  const completedDays = plan.days.filter((d) => d.status === 'completed').length;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const today = new Date();
  const expectedCompleted = plan.days.filter((d) => new Date(d.date) <= today).length;
  const onTrack = completedDays >= expectedCompleted;

  return { totalDays, completedDays, percentage, expectedCompleted, onTrack };
}

async function getCourseProgress(courseId, userId) {
  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  const plan = await StudyPlan.findOne({ course: courseId, user: userId });
  if (!plan) throw new Error('Study plan not found');

  return { course: { id: course._id, title: course.title, status: course.status }, ...computeCourseProgress(plan) };
}

async function getUserProgressSummary(userId) {
  const user = await User.findById(userId);
  const courses = await Course.find({ user: userId, status: { $in: ['active', 'completed'] }, archived: { $ne: true } }).sort(
    '-createdAt'
  );

  let todayTask = null;
  let overallCompleted = 0;
  let overallTotal = 0;
  const courseSummaries = [];

  for (const course of courses) {
    const plan = await StudyPlan.findOne({ course: course._id, user: userId });
    if (!plan) continue;

    const progress = computeCourseProgress(plan);
    overallCompleted += progress.completedDays;
    overallTotal += progress.totalDays;
    courseSummaries.push({ courseId: course._id, title: course.title, ...progress });

    if (!todayTask) {
      const nextPending = plan.days.find((d) => d.status === 'pending');
      if (nextPending) {
        todayTask = {
          courseId: course._id,
          courseTitle: course.title,
          dayNumber: nextPending.dayNumber,
          topic: nextPending.topic,
          subtopics: nextPending.subtopics,
        };
      }
    }
  }

  return {
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    overallCompletionPercentage: overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0,
    activeCourseCount: courses.filter((c) => c.status === 'active').length,
    todayTask,
    courses: courseSummaries,
  };
}

// Monday 00:00:00 through the following Monday 00:00:00 (exclusive), so a
// full calendar week regardless of what day "today" falls on.
function getCurrentWeekRange(now = new Date()) {
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? 6 : day - 1;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

async function getWeeklyGoalProgress(userId) {
  const user = await User.findById(userId);
  const { start, end } = getCurrentWeekRange();

  const plans = await StudyPlan.find({ user: userId });

  let completedDaysThisWeek = 0;
  let completedMinutesThisWeek = 0;
  const distinctDatesCompleted = new Set(); // a "day" toward the goal = one calendar date with >=1 completion

  for (const plan of plans) {
    for (const day of plan.days) {
      if (day.status !== 'completed' || !day.completedAt) continue;
      const completedAt = new Date(day.completedAt);
      if (completedAt >= start && completedAt < end) {
        completedMinutesThisWeek += day.estimatedMinutes || 0;
        distinctDatesCompleted.add(completedAt.toISOString().slice(0, 10));
      }
    }
  }
  completedDaysThisWeek = distinctDatesCompleted.size;

  return {
    weekStart: start,
    weekEnd: end,
    targetDays: user.weeklyGoalDays,
    completedDays: completedDaysThisWeek,
    daysPercentage: Math.min(100, Math.round((completedDaysThisWeek / user.weeklyGoalDays) * 100)),
    targetMinutes: user.weeklyGoalMinutes,
    completedMinutes: completedMinutesThisWeek,
    minutesPercentage:
      user.weeklyGoalMinutes > 0 ? Math.min(100, Math.round((completedMinutesThisWeek / user.weeklyGoalMinutes) * 100)) : 0,
  };
}

module.exports = { getUserProgressSummary, getCourseProgress, getWeeklyGoalProgress };