const Table = require('../models/Table.model');
const QRCode = require('../models/QRCode.model');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { uploadFile, deleteFile } = require('../utils/storage');
const { put } = require('@vercel/blob');

// Get all tables
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 }).populate('qrCode');
    res.json(tables);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single table by ID (protected)
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('qrCode');
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single table by ID (public)
exports.getTableByIdPublic = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('qrCode');
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    res.json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create new table
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, section } = req.body;

    // Check if table with same number exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table with this number already exists' });
    }

    const newTable = new Table({
      tableNumber,
      capacity,
      section,
      isActive: true
    });

    const savedTable = await newTable.save();
    res.status(201).json(savedTable);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update table
exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, section, isActive } = req.body;
    
    // If tableNumber is being updated, check if it's unique
    if (tableNumber) {
      const existingTable = await Table.findOne({ 
        tableNumber, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingTable) {
        return res.status(400).json({ message: 'Table with this number already exists' });
      }
    }
    
    const tableFields = {
      tableNumber,
      capacity,
      section,
      isActive
    };

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { $set: tableFields },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete table
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // If table has QR code, delete it too
    if (table.qrCode) {
      const qrCode = await QRCode.findById(table.qrCode);
      if (qrCode) {
        // Delete QR code image file
        if (qrCode.code) {
          if (qrCode.code.startsWith('http://') || qrCode.code.startsWith('https://')) {
            // Delete from Vercel Blob
            await deleteFile(qrCode.code);
          } else {
            // Handle legacy file deletion
            const filePath = path.join(__dirname, '..', qrCode.code);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
        await qrCode.deleteOne();
      }
    }

    await table.deleteOne();
    res.json({ message: 'Table removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Generate QR code for table
exports.generateQRCode = async (req, res) => {
  try {
    const { baseUrl } = req.body;
    const table = await Table.findById(req.params.id);
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    // Delete existing QR code if it exists
    if (table.qrCode) {
      // Handle deletion - note: Vercel Blob might not support deletion in free tier
      // Just update the record and let Vercel Blob handle garbage collection
      await QRCode.findByIdAndDelete(table.qrCode);
    }

    // Generate URL with table ID
    const url = `${baseUrl}/menu?table=${table._id}`;
    
    // Generate QR code as buffer
    const qrBuffer = await new Promise((resolve, reject) => {
      qrcode.toBuffer(url, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });
    
    // Upload to Vercel Blob
    const blob = await put(`qr-table-${table.tableNumber}-${Date.now()}.png`, qrBuffer, { 
      access: 'public',
      contentType: 'image/png'
    });

    const newQRCode = new QRCode({
      section: `Table ${table.tableNumber}`,
      url,
      code: blob.url, // Store the full Blob URL
      type: 'table',
      tableId: table._id
    });

    const savedQRCode = await newQRCode.save();
    
    // Update table with QR code reference
    table.qrCode = savedQRCode._id;
    await table.save();

    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};