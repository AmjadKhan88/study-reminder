const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const ctrl = require('../controllers/search.controller');

router.use(requireAuth);
router.get('/', ctrl.search);

module.exports = router;