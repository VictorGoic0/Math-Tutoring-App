// IMPORTANT: Load environment variables BEFORE any other imports
require('dotenv').config();

// Now import everything else AFTER env vars are loaded
const express = require('express');
const cors = require('cors');
require('./utils/firebaseAdmin.js');
const { verifyAuthToken, optionalAuth } = require('./middleware/auth.js');
const chatRouter = require('./routes/chat.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS: Only needed for local development (different ports)
// In production on Vercel, frontend and backend are same origin
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Public test route (no auth required)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Protected route example (requires authentication)
app.get('/api/user/profile', verifyAuthToken, (req, res) => {
  res.json({ 
    message: 'Protected route accessed successfully',
    user: req.user 
  });
});

// Chat routes (protected - requires authentication)
app.use('/api', verifyAuthToken, chatRouter);

// Start server (only in local development)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel serverless
module.exports = app;

