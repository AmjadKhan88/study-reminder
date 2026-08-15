const FlashcardSet = require('../models/FlashcardSet.model');
const Course = require('../models/Course.model');
const { getOrGenerateDayContent } = require('./dayContent.service');
const { getAIProvider } = require('./ai');
const { buildFlashcardsPrompt } = require('./ai/promptBuilder');
const { parseJsonArrayResponse } = require('./ai/parseUtils');

async function getOrGenerateFlashcards(courseId, userId, dayNumber) {
  const existing = await FlashcardSet.findOne({ course: courseId, user: userId, dayNumber });
  if (existing) return existing;

  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  const day = await getOrGenerateDayContent(courseId, userId, dayNumber); // ensures content exists first

  const provider = getAIProvider(course.aiProvider);
  const prompt = buildFlashcardsPrompt({ topic: day.topic, subtopics: day.subtopics, content: day.content });
  const raw = await provider.generateJSON(prompt);
  const cards = parseJsonArrayResponse(raw);

  return FlashcardSet.create({ user: userId, course: courseId, dayNumber, cards });
}

module.exports = { getOrGenerateFlashcards };