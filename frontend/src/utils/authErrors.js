// Firebase Auth error code to user-friendly message mapping
export const AUTH_ERROR_MESSAGES = {
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/user-not-found": "No account found with this email. Please sign up.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "INVALID_LOGIN_CREDENTIALS": "Invalid email or password. Please try again.",
  "EMAIL_EXISTS": "An account with this email already exists.",
  "WEAK_PASSWORD": "Password should be at least 6 characters.",
};

/**
 * Get user-friendly error message from Firebase error
 * @param {Error|string} error - Firebase error object or error message string
 * @returns {string} User-friendly error message
 */
export function getAuthErrorMessage(error) {
  if (!error) return '';
  
  // If error is a string, try to extract code from it
  if (typeof error === 'string') {
    // Check if it matches any of our custom error codes
    if (AUTH_ERROR_MESSAGES[error]) {
      return AUTH_ERROR_MESSAGES[error];
    }
    
    // Try to extract Firebase error code from message string
    // Firebase error messages look like: "Firebase: Error (auth/invalid-credential)."
    const codeMatch = error.match(/auth\/[\w-]+/);
    if (codeMatch) {
      const code = codeMatch[0];
      if (AUTH_ERROR_MESSAGES[code]) {
        return AUTH_ERROR_MESSAGES[code];
      }
    }
    
    // Fallback to original message
    return error;
  }
  
  // If error is an Error object, check for code property
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
    return AUTH_ERROR_MESSAGES[error.code];
  }
  
  // Try to extract code from error message
  if (error.message) {
    const codeMatch = error.message.match(/auth\/[\w-]+/);
    if (codeMatch) {
      const code = codeMatch[0];
      if (AUTH_ERROR_MESSAGES[code]) {
        return AUTH_ERROR_MESSAGES[code];
      }
    }
    
    // Fallback to error message
    return error.message;
  }
  
  // Final fallback
  return 'An error occurred. Please try again.';
}

