const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const courseCtrl = require('../controllers/course.controller');
const planCtrl = require('../controllers/studyPlan.controller');

router.use(requireAuth);

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
  courseCtrl.createCourse
);

router.get('/', courseCtrl.getMyCourses);
router.get('/:id', courseCtrl.getCourseById);
router.delete('/:id', courseCtrl.deleteCourse);

router.post('/:id/generate-plan', planCtrl.generatePlan);
router.get('/:id/plan', planCtrl.getPlan);

module.exports = router;