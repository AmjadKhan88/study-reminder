function getDateString(date = new Date()) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Called whenever the user marks any day complete, anywhere. Mutates the
// user doc in-place — caller is responsible for saving it. One increment per
// calendar day maximum, regardless of how many days they complete that day.
function registerDailyActivity(user) {
  const today = getDateString();
  if (user.lastActivityDate === today) return user; // already counted today

  const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
  user.currentStreak = user.lastActivityDate === yesterday ? (user.currentStreak || 0) + 1 : 1;
  user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
  user.lastActivityDate = today;
  return user;
}

module.exports = { registerDailyActivity, getDateString };