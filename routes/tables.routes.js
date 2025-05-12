const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const tableController = require('../controllers/table.controller');

// Get all tables (protected)
router.get('/', auth, tableController.getAllTables);

// Get single table by ID (protected)
router.get('/:id', auth, tableController.getTableById);

// Get single table by ID (public)
router.get('/public/:id', tableController.getTableByIdPublic);

// Create new table (protected - owner, manager only)
router.post('/', auth, authorize('owner', 'manager'), tableController.createTable);

// Update table (protected - owner, manager only)
router.put('/:id', auth, authorize('owner', 'manager'), tableController.updateTable);

// Delete table (protected - owner, manager only)
router.delete('/:id', auth, authorize('owner', 'manager'), tableController.deleteTable);

// Generate QR code for table (protected - owner, manager only)
router.post('/:id/qrcode', auth, authorize('owner', 'manager'), tableController.generateQRCode);

module.exports = router;
