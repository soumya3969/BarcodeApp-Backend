const Joi = require('joi');
const logger = require('../utils/logger');

// Usage: validator(schema) where schema is a Joi schema
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