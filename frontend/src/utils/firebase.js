import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const firebaseAuth = getAuth(app);
export const firebaseFireStore = getFirestore(app);
export const firebaseStorage = getStorage(app);

// Auth helper functions
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Return error object with code for better error handling
    return { user: null, error: error };
  }
};

export const signUpUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    // Update user profile with displayName
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
      // Reload the user to get updated profile information
      await userCredential.user.reload();
    }
    return { user: userCredential.user, error: null };
  } catch (error) {
    // Return error object with code for better error handling
    return { user: null, error: error };
  }
};

export const signOutUser = async () => {
  try {
    await firebaseSignOut(firebaseAuth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(firebaseAuth, callback);
};

export default app;

