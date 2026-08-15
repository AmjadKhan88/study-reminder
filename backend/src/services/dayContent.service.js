const StudyPlan = require('../models/StudyPlan.model');
const Course = require('../models/Course.model');
const { getAIProvider } = require('./ai');
const { buildDayContentPrompt } = require('./ai/promptBuilder');
const { parseJsonObjectResponse } = require('./ai/parseUtils');

async function getOrGenerateDayContent(courseId, userId, dayNumber) {
  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  const plan = await StudyPlan.findOne({ course: courseId, user: userId });
  if (!plan) throw new Error('Study plan not found');

  const day = plan.days.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) throw new Error('Day not found in plan');

  if (day.content) return day; // already generated — serve from cache, no AI call

  const provider = getAIProvider(course.aiProvider);
  const prompt = buildDayContentPrompt({
    courseTitle: course.title,
    topic: day.topic,
    subtopics: day.subtopics,
    dayNumber: day.dayNumber,
  });
  const raw = await provider.generateJSON(prompt);
  const parsed = parseJsonObjectResponse(raw);

  day.content = parsed.content;
  day.keyConcepts = parsed.keyConcepts || [];
  day.tips = parsed.tips || [];
  day.contentGeneratedAt = new Date();

  await plan.save();
  return day;
}

module.exports = { getOrGenerateDayContent };