const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

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

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;