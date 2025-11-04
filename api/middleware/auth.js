const { auth } = require('../utils/firebaseAdmin.js');

/**
 * Middleware to verify Firebase authentication token
 * Expects Authorization header with format: "Bearer <token>"
 */
const verifyAuthToken = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No authentication token provided' 
      });
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];

    // Verify the token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name || null,
    };

    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication token has expired' 
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid authentication token' 
      });
    }

    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Failed to verify authentication token' 
    });
  }
};

/**
 * Optional middleware - allows requests with or without auth
 * If auth is provided, it will be verified and user attached to req
 * If not provided, req.user will be null
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name || null,
    };

    next();
  } catch (error) {
    // If token verification fails, just continue without user
    console.warn('Optional auth failed:', error.message);
    req.user = null;
    next();
  }
};

module.exports = { verifyAuthToken, optionalAuth };

