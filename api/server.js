// IMPORTANT: Load environment variables BEFORE any other imports
require('dotenv').config();

// Process-level error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('🔴 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Log but don't exit - let the application continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Promise Rejection at:', promise);
  console.error('Reason:', reason);
  // Log but don't exit - let the application continue
});

// Now import everything else AFTER env vars are loaded
const express = require('express');
const cors = require('cors');
// Firebase Admin will be initialized lazily on first use
const { verifyAuthToken, optionalAuth } = require('./middleware/auth.js');
const chatRouter = require('./routes/chat.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS: Frontend and backend are separate Vercel projects (different origins)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  try {
    res.json({ status: 'ok', message: 'Backend is running' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Public test route (no auth required)
app.get('/api/test', (req, res) => {
  try {
    res.json({ message: 'Backend API is working!' });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: 'Test route failed', message: error.message });
  }
});

// Protected route example (requires authentication)
app.get('/api/user/profile', verifyAuthToken, (req, res) => {
  try {
    res.json({ 
      message: 'Protected route accessed successfully',
      user: req.user 
    });
  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile', message: error.message });
  }
});

// Chat routes (protected - requires authentication)
app.use('/api', verifyAuthToken, chatRouter);

// Global error handler - catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server (only in local development)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel serverless
module.exports = app;

