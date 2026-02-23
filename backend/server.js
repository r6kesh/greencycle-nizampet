require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const agentRoutes = require('./routes/agents');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & parsing middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GreenCycle API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Business info endpoint
app.get('/api/business-info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: process.env.BUSINESS_NAME || 'GreenCycle Premium Scrap Services',
      phone: process.env.BUSINESS_PHONE || '+919876543210',
      whatsapp: process.env.BUSINESS_WHATSAPP || '+919876543210',
      tagline: 'Premium Scrap Collection at Your Doorstep',
      workingHours: '8:00 AM - 8:00 PM',
      workingDays: 'Monday - Saturday'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  let mongoUri = process.env.MONGODB_URI;

  // Try primary URI; fall back to in-memory DB if it fails
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (atlasErr) {
    console.warn('⚠️  Atlas unreachable:', atlasErr.message);
    console.log('🔄 Starting local in-memory MongoDB (development mode)...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to in-memory MongoDB (data resets on restart)');
      console.log('💡 To persist data, fix your MONGODB_URI in backend/.env');
    } catch (memErr) {
      console.error('❌ Could not start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 GreenCycle API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  });
}

startServer();

module.exports = app;
