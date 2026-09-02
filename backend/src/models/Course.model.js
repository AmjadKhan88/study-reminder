const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    outline: { type: String, required: true, maxlength: 20000 },
    durationValue: { type: Number, required: true, min: 1, max: 52 },
    durationUnit: { type: String, enum: ['weeks', 'months'], required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    aiProvider: { type: String, enum: ['gemini', 'openai', 'groq'], required: true },
    status: { type: String, enum: ['draft', 'generating', 'active', 'completed'], default: 'draft' },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseSchema.pre('save', function () {
  if (this.isNew || this.isModified('startDate') || this.isModified('durationValue') || this.isModified('durationUnit')) {
    const end = new Date(this.startDate);
    if (this.durationUnit === 'weeks') {
      end.setDate(end.getDate() + this.durationValue * 7);
    } else {
      end.setMonth(end.getMonth() + this.durationValue);
    }
    this.endDate = end;
  }
});

courseSchema.index({ user: 1, createdAt: -1 });
courseSchema.index({ user: 1, archived: 1 });
courseSchema.index({ title: 'text', outline: 'text' });

module.exports = mongoose.model('Course', courseSchema);