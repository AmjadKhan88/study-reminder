const Course = require('../models/Course.model');

exports.createCourse = async (req, res, next) => {
  try {
    const { title, outline, durationValue, durationUnit, aiProvider } = req.body;
    const course = await Course.create({
      user: req.userId,
      title,
      outline,
      durationValue,
      durationUnit,
      aiProvider,
    });
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ user: req.userId }).sort('-createdAt');
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};