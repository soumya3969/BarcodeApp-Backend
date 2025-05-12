const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const orderController = require('../controllers/order.controller');

// Get all orders (protected)
router.get('/', auth, orderController.getAllOrders);

// Get single order by ID (protected)
router.get('/:id', auth, orderController.getOrderById);

// Create new order (public - anyone can order from a table)
router.post('/', orderController.createOrder);

// Update order status (protected - staff, manager, owner)
router.put('/:id/status', auth, orderController.updateOrderStatus);

// Update payment status (protected - staff, manager, owner)
router.put('/:id/payment', auth, orderController.updatePaymentStatus);

module.exports = router;
