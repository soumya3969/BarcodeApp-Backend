const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Get all menu items (public access)
router.get('/menu', publicController.getAllMenuItems);

// Get menu categories (public access) - must come BEFORE /:id route
router.get('/menu/categories', publicController.getMenuCategories);

// Get specific menu item (public access) - must come AFTER other /menu routes
router.get('/menu/:id', publicController.getMenuItem);

// Get table information (public access)
router.get('/tables/:id', publicController.getTableById);

// Get menu for specific table (public access)
router.get('/tables/:id/menu', publicController.getTableMenu);

// Public endpoint to create an order
router.post('/orders', publicController.createOrder);

module.exports = router;
