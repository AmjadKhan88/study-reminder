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
    aiProviderPreference: {
      type: String,
      enum: ['gemini', 'openai', 'groq'],
      default: 'gemini',
    },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    reminderTime: { type: String, default: '18:00' }, // "HH:mm", 24-hour, local device time
    notificationsEnabled: { type: Boolean, default: true },
    pushToken: { type: String, default: null }, // Expo push token — groundwork for future server-triggered pushes
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