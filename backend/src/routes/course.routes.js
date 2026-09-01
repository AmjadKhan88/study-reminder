const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const courseCtrl = require('../controllers/course.controller');
const planCtrl = require('../controllers/studyPlan.controller');
const flashcardCtrl = require('../controllers/flashcard.controller');
const quizCtrl = require('../controllers/quiz.controller');
const noteCtrl = require('../controllers/lectureNote.controller');
const statsCtrl = require('../controllers/stats.controller');
const sessionCtrl = require('../controllers/studySession.controller');

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
router.patch(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('aiProvider').optional().isIn(['gemini', 'openai', 'groq']),
  ],
  validate,
  courseCtrl.updateCourse
);
router.patch('/:id/archive', courseCtrl.setArchived);
router.patch('/:id/unarchive', courseCtrl.setArchived);
router.delete('/:id', courseCtrl.deleteCourse);

router.post('/:id/generate-plan', planCtrl.generatePlan);
router.get('/:id/plan', planCtrl.getPlan);
router.get('/:id/progress', statsCtrl.getCourseProgressStats);

router.get('/:id/days/:dayNumber', planCtrl.getDayContent);
router.patch('/:id/days/:dayNumber/complete', planCtrl.markDayComplete);

router.get('/:id/days/:dayNumber/flashcards', flashcardCtrl.getFlashcards);

router.get('/:id/days/:dayNumber/quiz', quizCtrl.getQuiz);
router.post('/:id/days/:dayNumber/quiz/submit', quizCtrl.submitQuiz);

router.post('/:id/days/:dayNumber/sessions', sessionCtrl.logSession);
router.get('/:id/days/:dayNumber/sessions', sessionCtrl.getSessionsForDay);

router.post('/:id/notes', upload.single('file'), noteCtrl.uploadNote);
router.get('/:id/notes', noteCtrl.getNotes);
router.get('/:id/notes/:noteId', noteCtrl.getNoteById);
router.delete('/:id/notes/:noteId', noteCtrl.deleteNote);
router.post('/:id/notes/ask', noteCtrl.askQuestion);

module.exports = router;