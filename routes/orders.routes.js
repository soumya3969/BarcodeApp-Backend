const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');
const validator = require('../middleware/validator');
const { orderSchemas } = require('../middleware/validationSchemas');
const { asyncHandler } = require('../utils/errorHandler');

// Get all orders (protected)
router.get('/', auth, asyncHandler(orderController.getAllOrders));

// Get single order by ID (protected)
router.get('/:id', auth, asyncHandler(orderController.getOrderById));

// Create new order (public - anyone can order from a table)
router.post('/', validator(orderSchemas.create), asyncHandler(orderController.createOrder));

// Update order status (protected - staff, manager, owner)
router.put('/:id/status', auth, validator(orderSchemas.updateStatus), asyncHandler(orderController.updateOrderStatus));

// Update payment status (protected - staff, manager, owner)
router.put('/:id/payment', auth, validator(orderSchemas.updatePayment), asyncHandler(orderController.updatePaymentStatus));

module.exports = router;
