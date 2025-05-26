const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const offerRoutes = require('./routes/offers.routes');
const userRoutes = require('./routes/users.routes');
const qrCodeRoutes = require('./routes/qrcodes.routes');
const tableRoutes = require('./routes/tables.routes');
const orderRoutes = require('./routes/orders.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); 

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error: %s', error.message);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Load API rate limiter and error handlers
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Apply rate limiting to all API routes except public ones
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/menu', apiLimiter, menuRoutes);
app.use('/api/offers', apiLimiter, offerRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/qrcodes', apiLimiter, qrCodeRoutes);
app.use('/api/tables', apiLimiter, tableRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/public', publicRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; // Export the app for testing purposes