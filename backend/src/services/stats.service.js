const StudyPlan = require('../models/StudyPlan.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');

function computeCourseProgress(plan) {
  const totalDays = plan.days.length;
  const completedDays = plan.days.filter((d) => d.status === 'completed').length;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // "On track" = have they completed at least as many days as have already
  // passed on the calendar since the course started.
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
  const courses = await Course.find({ user: userId, status: { $in: ['active', 'completed'] } }).sort('-createdAt');

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

module.exports = { getUserProgressSummary, getCourseProgress };