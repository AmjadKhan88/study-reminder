const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({ front: String, back: String }, { _id: false });

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