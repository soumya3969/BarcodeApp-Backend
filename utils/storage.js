const { put, del } = require("@vercel/blob");

exports.uploadFile = async (buffer, filePath) => {
  try {
    const blob = await put(__filename, buffer, { access: "public" });
    return blob.url;
  } catch (error) {
    console.error("Error uploading file to vercel blob:", error);
    throw new Error("File upload failed");
  }
};

exports.deleteFile = async (url) => {
    try {
        await del(url);
    } catch (error) {
        console.error("Error deleting file from vercel blob:", error);
        throw new Error("File deletion failed");
        
    }
};
