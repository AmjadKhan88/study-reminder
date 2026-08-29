const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  ctrl.register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, ctrl.login);

router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

router.patch(
  '/me',
  requireAuth,
  [
    body('reminderTime')
      .optional()
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('reminderTime must be in HH:mm format'),
    body('notificationsEnabled').optional().isBoolean(),
    body('aiProviderPreference').optional().isIn(['gemini', 'openai', 'groq']),
  ],
  validate,
  ctrl.updateProfile
);

router.post('/push-token', requireAuth, ctrl.savePushToken);

router.post(
  '/forgot-password',
  resetLimiter,
  [body('email').isEmail().withMessage('Valid email required')],
  validate,
  ctrl.forgotPassword
);

router.post(
  '/reset-password',
  resetLimiter,
  [
    body('email').isEmail(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  ctrl.resetPassword
);

router.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  ctrl.changePassword
);

router.post(
  '/delete-account',
  requireAuth,
  [body('password').notEmpty().withMessage('Password is required to delete your account')],
  validate,
  ctrl.deleteAccount
);

module.exports = router;