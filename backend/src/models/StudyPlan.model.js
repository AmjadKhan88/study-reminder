const mongoose = require('mongoose');

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    topic: { type: String, required: true },
    subtopics: [String],
    estimatedMinutes: { type: Number, default: 45 },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: { type: Date, default: null },
    content: { type: String, default: null },
    keyConcepts: [String],
    tips: [String],
    contentGeneratedAt: { type: Date, default: null },
  },
  { _id: false }
);

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
    totalDays: { type: Number, required: true },
    days: [daySchema],
    generationStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    generationError: { type: String, default: null },
  },
  { timestamps: true }
);

studyPlanSchema.index({ 'days.topic': 'text', 'days.subtopics': 'text' });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);