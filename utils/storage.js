const { put, del } = require("@vercel/blob");
const logger = require('./logger');

exports.uploadFile = async (buffer, filename) => {
  try {
    // Use the provided filename instead of __filename
    const blob = await put(filename, buffer, { 
      access: "public",
      token: process.env.BARCODEAPP_READ_WRITE_TOKEN
    });
    return blob.url;
  } catch (error) {
    logger.error("Error uploading file to vercel blob:", error);
    throw new Error("File upload failed");
  }
};

exports.deleteFile = async (url) => {
    try {
        await del(url, {
          token: process.env.BARCODEAPP_READ_WRITE_TOKEN
        });
    } catch (error) {
        logger.error("Error deleting file from vercel blob:", error);
        throw new Error("File deletion failed");
    }
};
