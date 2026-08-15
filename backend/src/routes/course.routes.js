const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/course.controller');

router.use(requireAuth); // every route below requires a valid access token

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('outline').trim().isLength({ min: 20 }).withMessage('Outline must be at least 20 characters'),
    body('durationValue').isInt({ min: 1, max: 52 }).withMessage('Duration must be between 1 and 52'),
    body('durationUnit').isIn(['weeks', 'months']).withMessage('Duration unit must be weeks or months'),
    body('aiProvider').isIn(['gemini', 'openai', 'groq']).withMessage('Invalid AI provider'),
  ],
  validate,
  ctrl.createCourse
);

router.get('/', ctrl.getMyCourses);
router.get('/:id', ctrl.getCourseById);
router.delete('/:id', ctrl.deleteCourse);

module.exports = router;