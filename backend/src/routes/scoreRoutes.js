const express = require('express');
const scoreController = require('../controllers/scoreController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/leaderboard', scoreController.getLeaderboard);
router.get('/player/:player', scoreController.getScoresByPlayer);
router.get('/stats', scoreController.getStats);

// Route with optional authentication
router.post('/', authMiddleware.optionalAuth, scoreController.createScore);

// Protected routes - require authentication
router.use(authMiddleware.protect);
router.get('/me', scoreController.getMyScores);

module.exports = router; 