const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/stats.controller');

router.use(requireAuth);
router.get('/summary', ctrl.getSummary);
router.get('/weekly-goal', ctrl.getWeeklyGoal);

module.exports = router;