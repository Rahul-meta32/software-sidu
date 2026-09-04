const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Initialize Server Expiry Scheduler
const { startExpiryScheduler } = require('./utils/expiryScheduler');
startExpiryScheduler();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads folder statically so files can be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const demoSiteRoutes = require('./routes/demoSiteRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const serverCategoryRoutes = require('./routes/serverCategoryRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const demoRequestRoutes = require('./routes/demoRequestRoutes');
const scriptSiteRoutes = require('./routes/scriptSiteRoutes');
const bankDetailRoutes = require('./routes/bankDetailRoutes');
const publicBankDetailRoutes = require('./routes/publicBankDetailRoutes');

// Mount Routes
app.use('/api/admin', authRoutes); // Exposes POST /api/admin/login
app.use('/api/admin/bank-details', bankDetailRoutes); // Exposes Bank Details CRUD (Superadmin Only)
app.use('/api/bank-details', publicBankDetailRoutes); // Exposes Safe Public Read-only Bank Details
app.use('/api', demoSiteRoutes);     // Exposes POST /api/admin/demo-sites, GET /api/demo-sites, etc.
app.use('/api', categoryRoutes);     // Exposes GET /api/categories, POST /api/admin/categories, etc.
app.use('/api', serverCategoryRoutes); // Exposes GET /api/server-categories, etc.
app.use('/api', complaintRoutes);    // Exposes POST /api/demo-sites/:id/complain
app.use('/api', demoRequestRoutes);  // Exposes POST /api/demo-requests
app.use('/api/homepage', homepageRoutes); // Exposes GET /api/homepage, etc.
app.use('/api', scriptSiteRoutes); // Exposes GET /api/script-sites, etc.

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy and running' });
});

// Multer and general Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack || err.message);

  // Multer errors (e.g. limit exceeded, file type reject)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File upload failed: File size is too large (Limit is 100MB)',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'File upload failed: Unexpected field name or too many files uploaded',
    });
  }

  // General server errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Configure 10-minute timeout for large file uploads (167MB+)
server.timeout = 10 * 60 * 1000;
server.keepAliveTimeout = 10 * 60 * 1000;
server.headersTimeout = 10 * 60 * 1000 + 1000;


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
