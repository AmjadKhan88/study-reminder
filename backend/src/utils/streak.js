function getDateString(date = new Date()) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ISO week identifier, e.g. "2026-W39" — used to grant one freeze per calendar week.
function getISOWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

const MAX_STORED_FREEZES = 1;

// Grants one streak freeze per calendar week, capped at MAX_STORED_FREEZES.
// Mutates the user doc in-place — caller saves it. Safe to call every time;
// it's a no-op if this week's freeze was already granted.
function ensureWeeklyFreezeGrant(user) {
  const weekKey = getISOWeekKey();
  if (user.lastFreezeGrantWeek !== weekKey) {
    user.streakFreezesAvailable = Math.min((user.streakFreezesAvailable || 0) + 1, MAX_STORED_FREEZES);
    user.lastFreezeGrantWeek = weekKey;
  }
  return user;
}

// Called whenever the user marks any day complete, anywhere. Mutates the
// user doc in-place — caller is responsible for saving it. One increment per
// calendar day maximum, regardless of how many days they complete that day.
// If exactly one day was missed and a freeze is available, the freeze is
// spent to bridge the gap instead of resetting the streak.
function registerDailyActivity(user) {
  const today = getDateString();
  if (user.lastActivityDate === today) return user; // already counted today

  const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const twoDaysAgo = getDateString(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));

  if (user.lastActivityDate === yesterday) {
    user.currentStreak = (user.currentStreak || 0) + 1;
  } else if (user.lastActivityDate === twoDaysAgo && (user.streakFreezesAvailable || 0) > 0) {
    // Exactly one day was missed — spend a freeze to bridge it.
    user.streakFreezesAvailable -= 1;
    user.currentStreak = (user.currentStreak || 0) + 1;
    user.freezeUsedLast = true; // transient flag, read once by the caller for messaging
  } else {
    user.currentStreak = 1;
  }

  user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
  user.lastActivityDate = today;
  return user;
}

module.exports = { registerDailyActivity, ensureWeeklyFreezeGrant, getISOWeekKey, getDateString };