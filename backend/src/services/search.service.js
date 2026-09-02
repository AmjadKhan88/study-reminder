const Course = require('../models/Course.model');
const LectureNote = require('../models/LectureNote.model');
const StudyPlan = require('../models/StudyPlan.model');

async function globalSearch(userId, query) {
  const q = (query || '').trim();
  if (q.length < 2) return { courses: [], notes: [], days: [] };

  const [courses, notes, plans] = await Promise.all([
    Course.find({ user: userId, archived: { $ne: true }, $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(8),
    LectureNote.find({ user: userId, status: 'ready', $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(8),
    StudyPlan.find({ user: userId, $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(8)
      .populate('course', 'title'),
  ]);

  // The text index matches at the plan-document level — narrow down to the
  // specific day(s) that actually contain the query so results are precise
  // rather than "somewhere in this 180-day plan."
  const lowerQ = q.toLowerCase();
  const days = [];
  for (const plan of plans) {
    if (!plan.course) continue; // course may have been deleted separately; skip orphaned plan defensively
    const matchingDays = plan.days.filter(
      (d) => d.topic.toLowerCase().includes(lowerQ) || d.subtopics.some((s) => s.toLowerCase().includes(lowerQ))
    );
    for (const day of matchingDays.slice(0, 3)) {
      days.push({
        courseId: plan.course._id,
        courseTitle: plan.course.title,
        dayNumber: day.dayNumber,
        topic: day.topic,
        subtopics: day.subtopics,
      });
      if (days.length >= 10) break;
    }
    if (days.length >= 10) break;
  }

  return {
    courses: courses.map((c) => ({ id: c._id, title: c.title, status: c.status })),
    notes: notes.map((n) => ({
      id: n._id,
      courseId: n.course,
      title: n.title,
      summarySnippet: (n.summary || '').slice(0, 120),
    })),
    days,
  };
}

module.exports = { globalSearch };