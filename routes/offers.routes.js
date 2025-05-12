const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const offerController = require('../controllers/offer.controller');

// Get all offers
router.get('/', offerController.getAllOffers);

// Get active offers - must come BEFORE /:id route
router.get('/status/active', offerController.getActiveOffers);

// Get offer by ID
router.get('/:id', offerController.getOfferById);

// Create offer (protected)
router.post('/', auth, authorize('owner', 'manager'), offerController.createOffer);

// Update offer (protected)
router.put('/:id', auth, authorize('owner', 'manager'), offerController.updateOffer);

// Delete offer (protected)
router.delete('/:id', auth, authorize('owner', 'manager'), offerController.deleteOffer);

module.exports = router;