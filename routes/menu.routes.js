const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { upload, uploadToVercelBlob } = require('../middleware/upload');
const menuController = require('../controllers/menu.controller');
const Joi = require('joi');
const validator = require('../middleware/validator');

const menuItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  newCategory: Joi.string().optional(),
  isVegetarian: Joi.boolean().optional(),
  isVegan: Joi.boolean().optional(),
  isGlutenFree: Joi.boolean().optional()
});

// Get all menu items
router.get('/', menuController.getAllMenuItems);

// Get all categories - must come BEFORE the /:id route
router.get('/categories', menuController.getAllCategories);

// Get menu item by ID - must come AFTER specific routes like /categories
router.get('/:id', menuController.getMenuItemById);

// Create menu item (protected)
router.post('/', auth, authorize('owner', 'manager'), upload.single('image'), uploadToVercelBlob, validator(menuItemSchema), menuController.createMenuItem);

// Update menu item (protected)
router.put('/:id', auth, authorize('owner', 'manager'), upload.single('image'), uploadToVercelBlob, validator(menuItemSchema), menuController.updateMenuItem);

// Delete menu item (protected)
router.delete('/:id', auth, authorize('owner', 'manager'), menuController.deleteMenuItem);

module.exports = router;