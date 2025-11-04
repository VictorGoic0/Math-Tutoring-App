const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error('Firebase Admin SDK credentials not configured. Check your api/.env file.');
  }

  const serviceAccount = {
    project_id: projectId,  // Must be 'project_id' not 'projectId'
    private_key: privateKey.replace(/\\n/g, '\n'),  // Must be 'private_key' not 'privateKey'
    client_email: clientEmail,  // Must be 'client_email' not 'clientEmail'
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
  });

  console.log('✓ Firebase Admin SDK initialized successfully');
}

// Export both the admin instance and auth/db shortcuts
const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  admin,
  auth,
  db
};

