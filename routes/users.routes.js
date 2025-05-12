const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

// Get all users (protected - owner only)
router.get('/', auth, authorize('owner'), userController.getAllUsers);

// Get user by ID (protected)
router.get('/:id', auth, authorize('owner'), userController.getUserById);

// Create user (protected - owner only)
router.post('/', auth, authorize('owner'), userController.createUser);

// Update user (protected - owner only)
router.put('/:id', auth, authorize('owner'), userController.updateUser);

// Delete user (protected - owner only)
router.delete('/:id', auth, authorize('owner'), userController.deleteUser);

module.exports = router;