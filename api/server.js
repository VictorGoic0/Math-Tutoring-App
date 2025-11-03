import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Initialize Firebase Admin after env vars are loaded
import './utils/firebaseAdmin.js';
import { verifyAuthToken, optionalAuth } from './middleware/auth.js';
import chatRouter from './routes/chat.js';

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
export default app;

