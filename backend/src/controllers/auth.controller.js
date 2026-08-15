const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

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
    res.status(201).json({
      accessToken,
      refreshToken, // mobile client stores this in SecureStore
      user: { id: user._id, name: user.name, email: user.email },
    });
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
    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
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
  } catch (_) {
    // token already invalid — nothing to clean up
  }
  res.clearCookie('refreshToken', cookieOpts);
  res.json({ message: 'Logged out' });
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};