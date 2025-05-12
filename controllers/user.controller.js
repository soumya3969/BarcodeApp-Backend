const User = require('../models/User.model');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const { name, email, role, password } = req.body;
    
    // Find the user first
    let user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Handle password update separately to ensure hashing
    if (password && password.trim() !== '') {
      // Update password (will be hashed by pre-save hook)
      user.password = password;
      
      // Update other fields if provided
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      
      // Save to trigger the pre-save hook for password hashing
      await user.save();
      
      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;
      return res.json(userResponse);
    } else {
      // For updates without password changes, we can use findByIdAndUpdate
      const userFields = {};
      if (name) userFields.name = name;
      if (email) userFields.email = email;
      if (role) userFields.role = role;
      
      user = await User.findByIdAndUpdate(
        id,
        { $set: userFields },
        { new: true }
      ).select('-password');
      
      return res.json(user);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};