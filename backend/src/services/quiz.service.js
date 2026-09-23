const Quiz = require('../models/Quiz.model');
const Course = require('../models/Course.model');
const { getOrGenerateDayContent } = require('./dayContent.service');
const { getAIProvider } = require('./ai');
const { buildQuizPrompt } = require('./ai/promptBuilder');
const { parseJsonArrayResponse } = require('./ai/parseUtils');

async function getOrGenerateQuiz(courseId, userId, dayNumber) {
  const existing = await Quiz.findOne({ course: courseId, user: userId, dayNumber });
  if (existing) return existing;

  const course = await Course.findOne({ _id: courseId, user: userId });
  if (!course) throw new Error('Course not found');

  const day = await getOrGenerateDayContent(courseId, userId, dayNumber);

  const provider = getAIProvider(course.aiProvider);
  const prompt = buildQuizPrompt({ topic: day.topic, subtopics: day.subtopics, content: day.content });
  const raw = await provider.generateJSON(prompt);
  const questions = parseJsonArrayResponse(raw);

  return Quiz.create({ user: userId, course: courseId, dayNumber, questions });
}

async function submitQuizAttempt(courseId, userId, dayNumber, answers) {
  const quiz = await Quiz.findOne({ course: courseId, user: userId, dayNumber });
  if (!quiz) throw new Error('Quiz not found');

  let correct = 0;
  quiz.questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) {
      correct++;
      q.timesCorrect += 1;
    } else {
      q.timesWrong += 1;
    }
  });
  const score = Math.round((correct / quiz.questions.length) * 100);

  quiz.attempts += 1;
  quiz.bestScore = quiz.bestScore === null ? score : Math.max(quiz.bestScore, score);
  await quiz.save();

  return { score, correct, total: quiz.questions.length, bestScore: quiz.bestScore };
}

module.exports = { getOrGenerateQuiz, submitQuizAttempt };