const QRCode = require("../models/QRCode.model");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs");
const { uploadFile, deleteFile } = require("../utils/storage");

// Get all QR codes
exports.getAllQRCodes = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    const qrCodes = await QRCode.find(query).populate("tableId");
    res.json(qrCodes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get QR code by ID
exports.getQRCodeById = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id).populate("tableId");

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    res.json(qrCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create global QR code
exports.createGlobalQRCode = async (req, res) => {
  try {
    const { section, url } = req.body;

    // Generate QR code
    const qrCodePath = path.join(
      __dirname,
      "..",
      "uploads",
      `qr-${Date.now()}.png`
    );
    await qrcode.toFile(qrCodePath, url);

    const code = `/uploads/${path.basename(qrCodePath)}`;

    const newQRCode = new QRCode({
      section,
      url,
      code,
      type: "global",
    });

    const savedQRCode = await newQRCode.save();
    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create global menu QR code
exports.createGlobalMenuQR = async (req, res) => {
  try {
    const { url } = req.body; // Frontend base URL

    // Generate QR code as buffer
    // const qrBuffer = await qrcode.toBuffer(url, { type: 'png' });
    const qrBuffer = await qrcode.toBuffer(url);

    // upload to vercel blob storage
    const fileName = `qr-global-${Date.now()}.png`;

    const fileUrl = await uploadFile(qrBuffer, fileName);

    // create new QR code document with full URL

    const newQRCode = new QRCode({
      section: "Global Menu",
      url: url,
      code: fileUrl,
      type: "global",
    });

    const savedQRCode = await newQRCode.save();
    res.status(201).json(savedQRCode);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete QR code
exports.deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    // Delete QR code from vercel blob storage if it's full URL
    if (
      qrCode.code &&
      (qrCode.code.startsWith("http://") || qrCode.code.startsWith("https://"))
    ) {
      await deleteFile(qrCode.code);
    }

    await qrCode.deleteOne();
    res.json({ message: "QR code removed" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
