const QRCode = require('../models/QRCode.model');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Get all QR codes
exports.getAllQRCodes = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    const qrCodes = await QRCode.find(query).populate('tableId');
    res.json(qrCodes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get QR code by ID
exports.getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id).populate('tableId');
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create global QR code
exports.createGlobalQRCode = async (req, res) => {
  try {
    const { section, url } = req.body;

    // Generate QR code
    const qrCodePath = path.join(__dirname, '..', 'uploads', `qr-${Date.now()}.png`);
    await qrcode.toFile(qrCodePath, url);
    
    const code = `/uploads/${path.basename(qrCodePath)}`;

    const newQRCode = new QRCode({
      section,
      url,
      code,
      type: 'global'
    });

    const savedQRCode = await newQRCode.save();
    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create global menu QR code
exports.createGlobalMenuQRCode = async (req, res) => {
  try {
    const { baseUrl } = req.body; // Frontend base URL
    
    // Generate URL for global menu
    const url = `${baseUrl}/menu`;
    
    // Generate QR code
    const qrCodePath = path.join(__dirname, '..', 'uploads', `qr-global-${Date.now()}.png`);
    await qrcode.toFile(qrCodePath, url);
    
    const code = `/uploads/${path.basename(qrCodePath)}`;

    const newQRCode = new QRCode({
      section: 'Global Menu',
      url,
      code,
      type: 'global'
    });

    const savedQRCode = await newQRCode.save();
    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete QR code
exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Delete QR code image file
    const filePath = path.join(__dirname, '..', qrCode.code);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await qrCode.deleteOne();
    res.json({ message: 'QR code removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};