const StudyPlan = require('../models/StudyPlan.model');
const User = require('../models/User.model');
const { generateStudyPlanForCourse } = require('../services/studyPlan.service');
const { getOrGenerateDayContent } = require('../services/dayContent.service');
const { registerDailyActivity } = require('../utils/streak');

exports.generatePlan = async (req, res, next) => {
  try {
    const plan = await generateStudyPlanForCourse(req.params.id, req.userId);
    res.status(201).json({ plan });
  } catch (err) {
    if (err.message === 'Course not found') return res.status(404).json({ message: err.message });
    next(err);
  }
};

exports.getPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ course: req.params.id, user: req.userId });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
};

exports.getDayContent = async (req, res, next) => {
  try {
    const forceRegenerate = req.query.regenerate === 'true';
    const day = await getOrGenerateDayContent(req.params.id, req.userId, req.params.dayNumber, forceRegenerate);
    res.json({ day });
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    next(err);
  }
};

exports.markDayComplete = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOne({ course: req.params.id, user: req.userId });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    const day = plan.days.find((d) => d.dayNumber === Number(req.params.dayNumber));
    if (!day) return res.status(404).json({ message: 'Day not found' });

    if (day.status !== 'completed') {
      day.status = 'completed';
      day.completedAt = new Date();
      await plan.save();

      const user = await User.findById(req.userId);
      registerDailyActivity(user);
      await user.save();
    }

    res.json({ day });
  } catch (err) {
    next(err);
  }
};