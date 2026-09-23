const Quiz = require('../models/Quiz.model');
const StudyPlan = require('../models/StudyPlan.model');
const Course = require('../models/Course.model');

const WEAK_THRESHOLD = 0.6; // below 60% accuracy counts as a weak topic
const MIN_ATTEMPTS = 2; // ignore questions answered fewer than this many times total

async function getWeakTopics(userId) {
  const quizzes = await Quiz.find({ user: userId, attempts: { $gt: 0 } });
  if (quizzes.length === 0) return { weakTopics: [] };

  const courseIds = [...new Set(quizzes.map((q) => q.course.toString()))];
  const [courses, plans] = await Promise.all([
    Course.find({ _id: { $in: courseIds } }),
    StudyPlan.find({ course: { $in: courseIds } }),
  ]);

  const courseById = new Map(courses.map((c) => [c._id.toString(), c]));
  const planByCourse = new Map(plans.map((p) => [p.course.toString(), p]));

  const topicStats = new Map(); // key: courseId|dayNumber -> { correct, wrong, topic, courseTitle, courseId, dayNumber }

  for (const quiz of quizzes) {
    const plan = planByCourse.get(quiz.course.toString());
    const dayInfo = plan?.days.find((d) => d.dayNumber === quiz.dayNumber);
    const course = courseById.get(quiz.course.toString());
    if (!dayInfo || !course) continue;

    let correct = 0;
    let wrong = 0;
    for (const q of quiz.questions) {
      correct += q.timesCorrect;
      wrong += q.timesWrong;
    }
    if (correct + wrong < MIN_ATTEMPTS) continue;

    const key = `${quiz.course}|${quiz.dayNumber}`;
    topicStats.set(key, {
      courseId: quiz.course,
      courseTitle: course.title,
      dayNumber: quiz.dayNumber,
      topic: dayInfo.topic,
      correct,
      wrong,
      accuracy: Math.round((correct / (correct + wrong)) * 100),
    });
  }

  const weakTopics = [...topicStats.values()]
    .filter((t) => t.accuracy / 100 < WEAK_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy);

  return { weakTopics };
}

module.exports = { getWeakTopics };