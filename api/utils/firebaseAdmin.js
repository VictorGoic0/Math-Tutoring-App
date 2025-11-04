const admin = require('firebase-admin');

// Lazy initialization - only initialize when first accessed
let initialized = false;

function initializeFirebase() {
  if (initialized) {
    return;
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    const missing = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    throw new Error(`Firebase Admin SDK credentials not configured. Missing: ${missing.join(', ')}. Check your environment variables.`);
  }

  const serviceAccount = {
    projectId: projectId,
    privateKey: privateKey
    .replace(/\\n/g, '\n')     // Fix escaped \n
    .trim(),
    clientEmail: clientEmail,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  console.log('✓ Firebase Admin SDK initialized successfully');
}

// Getter functions - initialize on first access
function getAdmin() {
  if (!initialized) {
    initializeFirebase();
  }
  return admin;
}

function getAuth() {
  if (!initialized) {
    initializeFirebase();
  }
  return admin.auth();
}

function getDb() {
  if (!initialized) {
    initializeFirebase();
  }
  return admin.firestore();
}

module.exports = {
  getAdmin,
  getAuth,
  getDb
};

