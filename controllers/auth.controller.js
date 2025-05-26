const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const response = require('../utils/responseHandler');
const logger = require('../utils/logger');

// Register user
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return response.badRequest(res, 'User already exists');
  }

  // Create new user
  user = new User({
    name,
    email,
    password,
    role: role || 'staff'
  });

  await user.save();
  logger.info(`New user registered: ${email} with role ${role || 'staff'}`);

  // Generate JWT with expiration
  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );

  return response.success(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }, 'User registered successfully', 201);
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    logger.warn(`Failed login attempt for email: ${email} - User not found`);
    return response.unauthorized(res, 'Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn(`Failed login attempt for email: ${email} - Invalid password`);
    return response.unauthorized(res, 'Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );

  logger.info(`User logged in: ${email}`);
  return response.success(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }, 'Login successful');
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  return response.success(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  }, 'User details retrieved');
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return response.notFound(res, 'User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  // In a real app, send email with the reset token
  logger.info(`Reset token generated for ${email}: ${resetToken}`);

  return response.success(res, null, 'Password reset email sent');
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Find user with token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return response.badRequest(res, 'Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  logger.info(`Password reset completed for user: ${user.email}`);

  return response.success(res, null, 'Password has been reset');
};