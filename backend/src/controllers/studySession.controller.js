const StudySession = require('../models/StudySession.model');
const Course = require('../models/Course.model');

exports.logSession = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { targetMinutes, actualMinutes, completedFully, startedAt, endedAt } = req.body;

    const session = await StudySession.create({
      user: req.userId,
      course: course._id,
      dayNumber: Number(req.params.dayNumber),
      targetMinutes,
      actualMinutes,
      completedFully,
      startedAt,
      endedAt,
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

exports.getSessionsForDay = async (req, res, next) => {
  try {
    const sessions = await StudySession.find({
      user: req.userId,
      course: req.params.id,
      dayNumber: Number(req.params.dayNumber),
    }).sort('-createdAt');

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
};