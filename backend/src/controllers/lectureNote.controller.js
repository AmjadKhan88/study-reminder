const LectureNote = require('../models/LectureNote.model');
const Course = require('../models/Course.model');
const { processLectureNote, answerQuestion } = require('../services/lectureNote.service');
const { deleteByNote } = require('../services/vectorStore.service');

exports.uploadNote = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const course = await Course.findOne({ _id: req.params.id, user: req.userId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const dayNumber = req.body.dayNumber ? Number(req.body.dayNumber) : null;

    const note = await LectureNote.create({
      user: req.userId,
      course: course._id,
      dayNumber,
      title: req.body.title?.trim() || req.file.originalname,
      originalFilename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      status: 'processing',
    });

    // Heavy work happens after the response is sent — client polls status.
    processLectureNote(note._id, req.file.buffer).catch((err) => {
      console.error('Lecture note processing failed:', err);
    });

    res.status(202).json({ note });
  } catch (err) {
    next(err);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const notes = await LectureNote.find({ course: req.params.id, user: req.userId }).sort('-createdAt');
    res.json({ notes });
  } catch (err) {
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await LectureNote.findOne({ _id: req.params.noteId, course: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await LectureNote.findOneAndDelete({ _id: req.params.noteId, course: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    await deleteByNote(note._id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};

exports.askQuestion = async (req, res, next) => {
  try {
    const { question, noteId } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: 'Question is required' });

    const answer = await answerQuestion({
      courseId: req.params.id,
      userId: req.userId,
      question: question.trim(),
      noteId: noteId || null,
    });
    res.json(answer);
  } catch (err) {
    if (err.message === 'Course not found') return res.status(404).json({ message: err.message });
    next(err);
  }
};