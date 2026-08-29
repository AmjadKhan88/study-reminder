const { getUserProgressSummary, getCourseProgress } = require('../services/stats.service');

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