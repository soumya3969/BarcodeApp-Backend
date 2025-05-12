const Offer = require('../models/Offer.model');

// Get all offers
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ startDate: 1 });
    res.json(offers);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get offer by ID
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    res.json(offer);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get active offers
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    res.json(offers);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create offer
exports.createOffer = async (req, res) => {
  try {
    const { name, description, discount, startDate, endDate } = req.body;

    const newOffer = new Offer({
      name,
      description,
      discount,
      startDate,
      endDate
    });

    const offer = await newOffer.save();
    res.status(201).json(offer);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update offer
exports.updateOffer = async (req, res) => {
  try {
    const { name, description, discount, startDate, endDate } = req.body;
    
    const offerFields = {
      name,
      description,
      discount,
      startDate,
      endDate
    };

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: offerFields },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json(offer);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await offer.deleteOne();
    res.json({ message: 'Offer removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};