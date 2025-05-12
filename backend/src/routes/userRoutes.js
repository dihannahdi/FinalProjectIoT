const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Protected routes - require authentication
router.use(authMiddleware.protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/updatePassword', userController.updatePassword);

// High score route
router.get('/highscore', userController.getHighScore);

module.exports = router; 