const multer = require('multer');
const { put } = require('@vercel/blob');
const path = require('path');

// In-memory storage for multer
const storage = multer.memoryStorage();

// Initialize upload with memory storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
}

// Middleware to handle Vercel Blob upload after multer
async function uploadToVercelBlob(req, res, next) {
  try {
    if (!req.file) {
      return next();
    }

    // Upload to Vercel Blob
    const blob = await put(
      `${Date.now()}-${req.file.originalname}`, 
      req.file.buffer, 
      { access: 'public' }
    );

    // Add the blob URL to the request
    req.file.blobUrl = blob.url;
    next();
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ message: 'File upload failed' });
  }
}

module.exports = { upload, uploadToVercelBlob };