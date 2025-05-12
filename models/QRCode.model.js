const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['global', 'table'],
    default: 'global'
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);