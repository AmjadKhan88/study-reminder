const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    dayNumber: { type: Number, required: true },
    targetMinutes: { type: Number, required: true },
    actualMinutes: { type: Number, required: true }, // real elapsed time, may be less than target if stopped early
    completedFully: { type: Boolean, default: false }, // true if the timer ran to zero, false if stopped early
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, course: 1, dayNumber: 1, createdAt: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);