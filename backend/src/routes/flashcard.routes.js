const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const flashcardCtrl = require('../controllers/flashcard.controller');

router.use(requireAuth);
router.get('/due', flashcardCtrl.getDueCards);

module.exports = router;