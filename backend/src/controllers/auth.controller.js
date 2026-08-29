const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');
const { sendPasswordResetEmail } = require('../services/email.service');
const { deleteAccountCompletely } = require('../services/account.service');

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    reminderTime: user.reminderTime,
    notificationsEnabled: user.notificationsEnabled,
    aiProviderPreference: user.aiProviderPreference,
  };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOpts);
    res.status(201).json({ accessToken, refreshToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshTokenHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOpts);
    res.json({ accessToken, refreshToken, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) return res.status(401).json({ message: 'Invalid session' });

    const matches = await bcrypt.compare(token, user.refreshTokenHash);
    if (!matches) return res.status(401).json({ message: 'Invalid session' });

    const accessToken = signAccessToken(user._id);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies.refreshToken;
    if (token) {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
    }
  } catch (_) {}
  res.clearCookie('refreshToken', cookieOpts);
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { reminderTime, notificationsEnabled, aiProviderPreference } = req.body;
    const update = {};
    if (reminderTime !== undefined) update.reminderTime = reminderTime;
    if (notificationsEnabled !== undefined) update.notificationsEnabled = notificationsEnabled;
    if (aiProviderPreference !== undefined) update.aiProviderPreference = aiProviderPreference;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.savePushToken = async (req, res, next) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) return res.status(400).json({ message: 'pushToken is required' });
    await User.findByIdAndUpdate(req.userId, { pushToken });
    res.json({ message: 'Push token saved' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const code = String(crypto.randomInt(100000, 999999));
      user.resetPasswordCodeHash = await bcrypt.hash(code, 10);
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      sendPasswordResetEmail(user.email, user.name, code).catch((err) =>
        console.error('Failed to send reset email:', err.message)
      );
    }

    res.json({ message: 'If that email is registered, a reset code has been sent.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+resetPasswordCodeHash +resetPasswordExpires');
    if (!user || !user.resetPasswordCodeHash || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
    }

    const matches = await bcrypt.compare(code, user.resetPasswordCodeHash);
    if (!matches) return res.status(400).json({ message: 'Invalid or expired code' });

    user.password = newPassword;
    user.resetPasswordCodeHash = null;
    user.resetPasswordExpires = null;
    user.refreshTokenHash = null;
    await user.save();

    res.json({ message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// Distinct from resetPassword: this is for a logged-in user who knows their
// current password and just wants to change it, not a locked-out user.
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password +refreshTokenHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const matches = await user.comparePassword(currentPassword);
    if (!matches) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    user.refreshTokenHash = null; // force re-login on all devices after a password change
    await user.save();

    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const matches = await user.comparePassword(password);
    if (!matches) return res.status(401).json({ message: 'Password is incorrect' });

    await deleteAccountCompletely(req.userId);
    res.clearCookie('refreshToken', cookieOpts);
    res.json({ message: 'Your account and all associated data have been deleted.' });
  } catch (err) {
    next(err);
  }
};