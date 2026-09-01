const Course = require('../models/Course.model');
const StudyPlan = require('../models/StudyPlan.model');
const FlashcardSet = require('../models/FlashcardSet.model');
const Quiz = require('../models/Quiz.model');
const LectureNote = require('../models/LectureNote.model');
const { deleteByCourse } = require('../services/vectorStore.service');

exports.createCourse = async (req, res, next) => {
  try {
    const { title, outline, durationValue, durationUnit, aiProvider } = req.body;
    const course = await Course.create({ user: req.userId, title, outline, durationValue, durationUnit, aiProvider });
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const showArchived = req.query.archived === 'true';
    const courses = await Course.find({ user: req.userId, archived: showArchived }).sort('-createdAt');
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

exports.updateCourse = async (req, res, next) => {
  try {
    const { title, aiProvider } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (aiProvider !== undefined) update.aiProvider = aiProvider;

    const course = await Course.findOneAndUpdate({ _id: req.params.id, user: req.userId }, update, {
      new: true,
      runValidators: true,
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

exports.setArchived = async (req, res, next) => {
  try {
    const archived = req.path.endsWith('/archive');
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { archived },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// True cascade delete — removes the course plus everything that depends on
// it (plan, flashcards, quizzes, notes, vectors). Previously this only
// deleted the Course document, leaving orphaned data behind.
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, user: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await StudyPlan.deleteMany({ course: course._id, user: req.userId });
    await FlashcardSet.deleteMany({ course: course._id, user: req.userId });
    await Quiz.deleteMany({ course: course._id, user: req.userId });
    await LectureNote.deleteMany({ course: course._id, user: req.userId });

    try {
      await deleteByCourse(course._id);
    } catch (err) {
      console.error(`Failed to delete Qdrant vectors for course ${course._id}:`, err.message);
    }

    await Course.findByIdAndDelete(course._id);
    res.json({ message: 'Course and all associated data deleted' });
  } catch (err) {
    next(err);
  }
};