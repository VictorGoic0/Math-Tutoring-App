/**
 * Storage Service
 * Firebase Storage operations for image uploads
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../utils/firebase';

/**
 * Upload an image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID for organizing uploads
 * @returns {Promise<string>} Download URL of uploaded image
 */
export async function uploadImage(file, userId) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('Image must be less than 10MB');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `chat-images/${userId}/${timestamp}_${sanitizedFileName}`;

    // Create storage reference
    const storageRef = ref(firebaseStorage, filePath);

    // Upload file
    console.log(`📤 Uploading image to: ${filePath}`);
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`✅ Image uploaded successfully: ${downloadURL}`);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string | null }
 */
export function validateImageFile(file) {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image (PNG, JPG, etc.)' };
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 10MB' };
  }

  return { valid: true, error: null };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

