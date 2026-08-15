const StudyPlan = require('../models/StudyPlan.model');
const Course = require('../models/Course.model');
const { getAIProvider } = require('./ai');

function diffInDays(start, end) {
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function expandWeeksToDays(weeklyBreakdown, totalDays, startDate) {
  const daysPerWeek = Math.ceil(totalDays / weeklyBreakdown.length);
  const days = [];
  let dayCounter = 1;

  for (const week of weeklyBreakdown) {
    const subtopics = week.subtopics?.length ? week.subtopics : [week.topic];
    for (let i = 0; i < daysPerWeek && dayCounter <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (dayCounter - 1));
      days.push({
        dayNumber: dayCounter,
        date,
        topic: week.topic,
        subtopics: [subtopics[i % subtopics.length]],
        estimatedMinutes: 45,
        status: 'pending',
      });
      dayCounter++;
    }
  }
  return days;
}

async function generateStudyPlanForCourse(courseId, userId) {
  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  course.status = 'generating';
  await course.save();

  try {
    const totalDays = diffInDays(course.startDate, course.endDate);
    const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));

    const provider = getAIProvider(course.aiProvider);
    const weeklyBreakdown = await provider.generateWeeklyBreakdown({
      title: course.title,
      outline: course.outline,
      totalWeeks,
    });

    const days = expandWeeksToDays(weeklyBreakdown, totalDays, course.startDate);

    const plan = await StudyPlan.findOneAndUpdate(
      { course: course._id },
      { user: userId, course: course._id, totalDays, days, generationStatus: 'completed', generationError: null },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    course.status = 'active';
    await course.save();
    return plan;
  } catch (err) {
    course.status = 'draft';
    await course.save();
    throw err;
  }
}

module.exports = { generateStudyPlanForCourse };