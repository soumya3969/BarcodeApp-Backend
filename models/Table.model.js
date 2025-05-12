const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    default: 'Main'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Table', tableSchema);
