const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Creates an Express middleware that validates and sanitizes the request body against a Joi schema.
 *
 * If validation fails, responds with HTTP 400 and an array of error messages. If validation succeeds, replaces {@link req.body} with the validated and sanitized value and passes control to the next middleware.
 *
 * @param {import('joi').Schema} schema - Joi schema to validate the request body against.
 * @returns {import('express').RequestHandler} Express middleware for request body validation.
 */
function validator(schema) {
  return (req, res, next) => {
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // allow unknown keys
      stripUnknown: true // remove unknown keys
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
      // Log validation errors if logger is available
      try {
        const logger = require('../utils/logger');
        logger.warn('Validation error: %o', error.details);
      } catch (e) {}
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    req.body = value;
    next();
  };
}

module.exports = validator;