/**
 * Chat Service
 * API calls and Firestore operations for chat functionality
 */

import { apiGet } from './api';
import { firebaseFireStore } from '../utils/firebase';
import { collection, addDoc, doc, serverTimestamp } from 'firebase/firestore';

/**
 * Load conversation history for the authenticated user
 * Returns: { conversationId, messages }
 * 
 * @param {string} authToken - Firebase auth token
 * @param {number} limit - Maximum number of messages to load (default: 100)
 * @returns {Promise<Object>} { conversationId: string | null, messages: Array }
 */
export async function loadConversationHistory(authToken, limit = 100) {
  try {
    const response = await apiGet(
      `/api/chat/history?limit=${limit}`,
      authToken
    );

    if (!response.ok) {
      throw new Error(`Failed to load conversation history: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      conversationId: data.conversationId || null,
      messages: data.messages || []
    };
  } catch (error) {
    console.error('Error loading conversation history:', error);
    throw error;
  }
}

/**
 * Create a new conversation in Firestore
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {string} firstMessage - First message content for title
 * @returns {Promise<string>} Conversation ID
 */
export async function createConversation(userId, firstMessage = '') {
  try {
    const title = firstMessage
      ? firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
      : 'New Conversation';
    
    const conversationRef = await addDoc(collection(firebaseFireStore, 'conversations'), {
      userId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
      lastMessage: ''
    });
    
    console.log(`✅ Created conversation: ${conversationRef.id}`);
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Save a message to Firestore
 * 
 * @param {string} conversationId - Conversation ID
 * @param {Object} message - Message object from useChat
 * @returns {Promise<void>}
 */
export async function saveMessage(conversationId, message) {
  try {
    const messagesRef = collection(
      firebaseFireStore,
      'conversations',
      conversationId,
      'messages'
    );
    
    await addDoc(messagesRef, {
      conversationId,
      role: message.role,
      content: message.content,
      timestamp: Date.now(),
      metadata: {}
    });
    
    console.log(`💾 Saved ${message.role} message to Firestore`);
  } catch (error) {
    console.error('Error saving message:', error);
    // Don't throw - we don't want to break the chat if save fails
  }
}

