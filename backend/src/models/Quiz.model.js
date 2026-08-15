const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    dayNumber: { type: Number, required: true },
    questions: [questionSchema],
    bestScore: { type: Number, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizSchema.index({ course: 1, dayNumber: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Quiz', quizSchema);