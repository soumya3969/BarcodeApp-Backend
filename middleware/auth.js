const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("../utils/logger");

const auth = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. Invalid token format." });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token exp
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ message: "Access denied. Token expired." });
    }
    
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Access denied. User not found." });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(401).json({ message: "Not authorized", error: error.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

module.exports = { auth, authorize };
