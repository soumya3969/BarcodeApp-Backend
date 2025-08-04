const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const offerRoutes = require('./routes/offers.routes');
const userRoutes = require('./routes/users.routes');
const qrCodeRoutes = require('./routes/qrcodes.routes');
const tableRoutes = require('./routes/tables.routes');
const orderRoutes = require('./routes/orders.routes');
const publicRoutes = require('./routes/public.routes'); // Import public routes

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// !todo: implement this for security later
// const whitelist = [process.env.CLIENT_URL, process.env.ADMIN_URL];
// Recommended CORS configuration
// const corsOptions = {
//   origin: process.env.CLIENT_URL,
//   credentials: true
// };

// app.use(cors(corsOptions));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); 

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

  const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds

    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/public', publicRoutes); // Add public routes that don't need authentication

// Basic route
app.get('/', (req, res) => {
  // res.send('Barcode App API is running');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = app; // Export the app for testing purposes