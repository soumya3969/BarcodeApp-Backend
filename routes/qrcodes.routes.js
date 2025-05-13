const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const qrcodeController = require('../controllers/qrcode.controller');

// Get all QR codes (protected)
router.get('/', auth, authorize('owner', 'manager'), qrcodeController.getAllQRCodes);

// Get QR code by ID (protected)
router.get('/:id', auth, qrcodeController.getQRCodeById);

// Create global QR code (protected)
router.post('/', auth, authorize('owner', 'manager'), qrcodeController.createGlobalQRCode);

// Create global menu QR code (protected)
router.post('/global-menu', auth, authorize('owner', 'manager'), qrcodeController.createGlobalMenuQRCode);

// Delete QR code (protected)
router.delete('/:id', auth, authorize('owner', 'manager'), qrcodeController.deleteQRCode);

module.exports = router;