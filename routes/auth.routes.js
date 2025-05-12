const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;