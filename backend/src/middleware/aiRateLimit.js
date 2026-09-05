const rateLimit = require('express-rate-limit');

// Keyed by req.userId (set by requireAuth, which runs before these limiters
// in every route pipeline) rather than IP — accurate per-user limits
// regardless of shared IPs (school wifi, mobile carriers, etc.), and immune
// to IP spoofing concerns entirely.
function makeUserRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userId || req.ip,
    message: { message: message || 'Too many requests. Please try again later.' },
  });
}

const aiGenerationLimiter = makeUserRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 40,
  message: 'You have reached the hourly limit for AI-generated content. Please try again later.',
});

const uploadLimiter = makeUserRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'You have reached the hourly limit for file uploads. Please try again later.',
});

const askLimiter = makeUserRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'You have reached the hourly limit for AI questions. Please try again later.',
});

module.exports = { aiGenerationLimiter, uploadLimiter, askLimiter };