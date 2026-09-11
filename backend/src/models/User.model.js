const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    aiProviderPreference: { type: String, enum: ['gemini', 'openai', 'groq'], default: 'gemini' },
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    reminderTime: { type: String, default: '18:00' },
    timezone: { type: String, default: 'UTC' },
    notificationsEnabled: { type: Boolean, default: true },
    pushToken: { type: String, default: null },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: String, default: null },
    weeklyGoalDays: { type: Number, default: 5, min: 1, max: 7 },
    weeklyGoalMinutes: { type: Number, default: 300, min: 0 },
    resetPasswordCodeHash: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshTokenHash: { type: String, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);