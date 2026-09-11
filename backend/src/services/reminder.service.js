const User = require('../models/User.model');
const Course = require('../models/Course.model');
const StudyPlan = require('../models/StudyPlan.model');
const { sendStudyReminderEmail } = require('./email.service');

/**
 * Returns the current hour (00-23) as a string, in the given IANA timezone.
 * Falls back to UTC if the timezone string is invalid/unrecognized.
 */
function getCurrentHourInTimezone(timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    });
    // en-US with hour12:false can return "24" for midnight in some Node/ICU versions — normalize it
    const hour = formatter.format(new Date()).padStart(2, '0');
    return hour === '24' ? '00' : hour;
  } catch (err) {
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`);
    return String(new Date().getUTCHours()).padStart(2, '0');
  }
}

async function sendDueReminders() {
  const now = new Date();

  // Only fetch users who have notifications on — timezone filtering happens per-user below
  // since MongoDB can't evaluate "current hour in this user's timezone" in a query.
  const users = await User.find({ notificationsEnabled: true, isActive: true });

  let sentCount = 0;

  for (const user of users) {
    try {
      const userHour = getCurrentHourInTimezone(user.timezone || 'UTC');
      const reminderHour = (user.reminderTime || '18:00').split(':')[0];

      if (userHour !== reminderHour) continue;

      const courses = await Course.find({ user: user._id, archived: false, status: { $ne: 'completed' } });
      if (courses.length === 0) continue;

      const courseIds = courses.map((c) => c._id);
      const plans = await StudyPlan.find({ course: { $in: courseIds }, generationStatus: 'completed' });

      let nextDay = null;
      let nextCourse = null;

      for (const plan of plans) {
        const pending = plan.days.find((d) => d.status === 'pending');
        if (pending) {
          nextDay = pending;
          nextCourse = courses.find((c) => c._id.equals(plan.course));
          break;
        }
      }

      if (!nextDay || !nextCourse) continue;

      await sendStudyReminderEmail(user.email, user.name, {
        courseTitle: nextCourse.title,
        dayNumber: nextDay.dayNumber,
        topic: nextDay.topic,
        streak: user.currentStreak,
      });

      sentCount += 1;
    } catch (err) {
      console.error(`Reminder failed for user ${user._id}:`, err.message);
    }
  }

  if (sentCount > 0) {
    console.log(`[reminders] Sent ${sentCount} reminder email(s) at ${now.toISOString()}`);
  }
}

module.exports = { sendDueReminders };