const QRCode = require('../models/QRCode.model');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { uploadFile, deleteFile } = require('../utils/storage');
const { put } = require('@vercel/blob');

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
    const { baseUrl } = req.body;
    
    // Generate URL for global menu
    const url = `${baseUrl}/menu`;
    
    // Generate QR code as buffer
    const qrBuffer = await new Promise((resolve, reject) => {
      qrcode.toBuffer(url, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });
    
    // Upload to Vercel Blob
    const blob = await put(
      `qr-global-${Date.now()}.png`, 
      qrBuffer, 
      { 
        access: 'public',
        contentType: 'image/png',
        token: process.env.BARCODEAPP_READ_WRITE_TOKEN
      }
    );

    const newQRCode = new QRCode({
      section: 'Global Menu',
      url,
      code: blob.url, // Store the full Blob URL
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
    
    // Delete from Vercel Blob Storage if it's a full URL
    if (qrCode.code && (qrCode.code.startsWith('http://') || qrCode.code.startsWith('https://'))) {
      await deleteFile(qrCode.code);
    }
    
    await qrCode.deleteOne();
    res.json({ message: 'QR code removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};