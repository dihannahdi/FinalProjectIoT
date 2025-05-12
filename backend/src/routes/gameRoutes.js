const express = require('express');
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Routes with optional authentication
router.post('/start', authMiddleware.optionalAuth, gameController.startGame);
router.post('/stop', gameController.stopGame);
router.get('/status', gameController.getDeviceStatus);

// Protected routes - require authentication (admin features)
router.use(authMiddleware.protect);
router.post('/sequence', gameController.setCustomSequence);

module.exports = router; 