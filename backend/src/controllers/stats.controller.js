const { getUserProgressSummary, getCourseProgress, getWeeklyGoalProgress } = require('../services/stats.service');
const { getWeakTopics } = require('../services/weakTopics.service');


exports.getSummary = async (req, res, next) => {
  try {
    const summary = await getUserProgressSummary(req.userId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

exports.getCourseProgressStats = async (req, res, next) => {
  try {
    const progress = await getCourseProgress(req.params.id, req.userId);
    res.json(progress);
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    next(err);
  }
};

exports.getWeeklyGoal = async (req, res, next) => {
  try {
    const progress = await getWeeklyGoalProgress(req.userId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
};


exports.getWeakTopics = async (req, res, next) => {
  try {
    const result = await getWeakTopics(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};