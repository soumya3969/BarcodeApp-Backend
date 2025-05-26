// filepath: /workspaces/BarcodeApp-Backend/utils/errorHandler.js
const logger = require('./logger');
const responseHandler = require('./responseHandler');

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Check if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return responseHandler.badRequest(res, 'Validation error', err.errors);
  }

  if (err.name === 'CastError') {
    // Mongoose cast error (usually invalid ID)
    return responseHandler.badRequest(res, 'Invalid ID format');
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    return responseHandler.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired
    return responseHandler.unauthorized(res, 'Token expired');
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    return responseHandler.badRequest(res, 'Duplicate value detected');
  }

  // Default to 500 internal server error
  return responseHandler.error(res, err.message || 'Internal Server Error');
};

// 404 handler for undefined routes
exports.notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  return responseHandler.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};

// Async handler to avoid try/catch repetition in controllers
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};