// filepath: /workspaces/BarcodeApp-Backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Basic rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});

// More restrictive limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      message: options.message
    });
  }
});

module.exports = { apiLimiter, loginLimiter };