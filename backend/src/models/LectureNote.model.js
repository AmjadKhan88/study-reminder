const mongoose = require('mongoose');

const lectureNoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    dayNumber: { type: Number, default: null },
    title: { type: String, required: true },
    originalFilename: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    errorMessage: { type: String, default: null },
    extractedCharCount: { type: Number, default: 0 },
    truncated: { type: Boolean, default: false },
    chunkCount: { type: Number, default: 0 },
    summary: { type: String, default: null },
    keyConcepts: [String],
  },
  { timestamps: true }
);

lectureNoteSchema.index({ user: 1, course: 1, createdAt: -1 });
lectureNoteSchema.index({ title: 'text', summary: 'text' });

module.exports = mongoose.model('LectureNote', lectureNoteSchema);