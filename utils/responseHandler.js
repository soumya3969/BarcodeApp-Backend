// filepath: /workspaces/BarcodeApp-Backend/utils/responseHandler.js
const logger = require('./logger');

// Standard success response
exports.success = (res, data, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Standard error response
exports.error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  // Log errors, but don't expose internal details to clients
  logger.error(`Error: ${message}${errors ? ` - Details: ${JSON.stringify(errors)}` : ''}`);
  
  const response = {
    success: false,
    message
  };
  
  // Only include errors in development environment
  if (errors && process.env.NODE_ENV === 'development') {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Not found response
exports.notFound = (res, message = 'Resource not found') => {
  return exports.error(res, message, 404);
};

// Bad request response
exports.badRequest = (res, message = 'Bad request', errors = null) => {
  return exports.error(res, message, 400, errors);
};

// Unauthorized response
exports.unauthorized = (res, message = 'Unauthorized') => {
  return exports.error(res, message, 401);
};

// Forbidden response
exports.forbidden = (res, message = 'Forbidden') => {
  return exports.error(res, message, 403);
};