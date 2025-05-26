const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');
const validator = require('../middleware/validator');
const { userSchemas } = require('../middleware/validationSchemas');
const { loginLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../utils/errorHandler');
const Joi = require('joi');

// Register user
router.post('/register', validator(userSchemas.register), asyncHandler(authController.register));

// Login user (with rate limiting)
router.post('/login', loginLimiter, validator(userSchemas.login), asyncHandler(authController.login));

// Get current user
router.get('/me', auth, asyncHandler(authController.getCurrentUser));

// Forgot password schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

// Reset password schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

// Forgot password
router.post(
  '/forgot-password', 
  validator(forgotPasswordSchema), 
  asyncHandler(authController.forgotPassword)
);

// Reset password
router.post(
  '/reset-password', 
  validator(resetPasswordSchema), 
  asyncHandler(authController.resetPassword)
);

module.exports = router;