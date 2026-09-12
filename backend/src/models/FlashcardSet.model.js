const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    front: String,
    back: String,
    // Spaced repetition (SM-2) state — per card, not per set
    repetitions: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 }, // days
    dueDate: { type: Date, default: Date.now },
    lastReviewed: { type: Date, default: null },
  },
  { _id: true } // each card now needs its own id to be reviewed individually
);

const flashcardSetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    dayNumber: { type: Number, required: true },
    cards: [cardSchema],
  },
  { timestamps: true }
);

flashcardSetSchema.index({ course: 1, dayNumber: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('FlashcardSet', flashcardSetSchema);