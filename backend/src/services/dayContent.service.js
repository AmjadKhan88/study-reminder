const StudyPlan = require('../models/StudyPlan.model');
const Course = require('../models/Course.model');
const { getAIProvider } = require('./ai');
const { buildDayContentPrompt } = require('./ai/promptBuilder');
const { parseJsonObjectResponse } = require('./ai/parseUtils');
const { embedText } = require('./embedding.service');
const { searchSimilar } = require('./vectorStore.service');

async function getOrGenerateDayContent(courseId, userId, dayNumber, forceRegenerate = false) {
  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  const plan = await StudyPlan.findOne({ course: courseId, user: userId });
  if (!plan) throw new Error('Study plan not found');

  const day = plan.days.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) throw new Error('Day not found in plan');

  if (day.content && !forceRegenerate) return day;

  // Pull relevant excerpts from the student's own uploaded notes, if any exist,
  // so today's content is grounded in their actual course material.
  let referenceMaterial = null;
  try {
    const queryVector = await embedText(`${day.topic} ${day.subtopics.join(' ')}`);
    const matches = await searchSimilar({ userId, courseId, queryVector, limit: 4 });
    if (matches.length > 0) referenceMaterial = matches.map((m) => m.text).join('\n\n---\n\n');
  } catch (err) {
    console.warn('Vector search skipped (no notes yet, or Qdrant unavailable):', err.message);
  }

  const provider = getAIProvider(course.aiProvider);
  const prompt = buildDayContentPrompt({
    courseTitle: course.title,
    topic: day.topic,
    subtopics: day.subtopics,
    dayNumber: day.dayNumber,
    referenceMaterial,
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