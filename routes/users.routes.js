const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const Joi = require('joi');
const validator = require('../middleware/validator');

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('owner', 'manager', 'staff')
});

// Get all users (protected - owner only)
router.get('/', auth, authorize('owner'), userController.getAllUsers);

// Get user by ID (protected)
router.get('/:id', auth, authorize('owner'), userController.getUserById);

// Create user (protected - owner only)
router.post('/', auth, authorize('owner'), validator(userSchema), userController.createUser);

// Update user (protected - owner only)
router.put('/:id', auth, authorize('owner'), validator(userSchema.fork(['password'], (schema) => schema.optional())), userController.updateUser);

// Delete user (protected - owner only)
router.delete('/:id', auth, authorize('owner'), userController.deleteUser);

module.exports = router;