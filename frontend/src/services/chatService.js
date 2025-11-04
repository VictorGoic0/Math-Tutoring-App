/**
 * Chat Service
 * API calls and Firestore operations for chat functionality
 */

import { firebaseFireStore } from '../utils/firebase';
import { collection, addDoc, doc, getDocs, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';

/**
 * Load conversation history for the authenticated user
 * Returns: { conversationId, messages }
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {number} messageLimit - Maximum number of messages to load (default: 100)
 * @returns {Promise<Object>} { conversationId: string | null, messages: Array }
 */
export async function loadConversationHistory(userId, messageLimit = 100) {
  try {
    // Get user's conversation (single conversation per user pattern)
    const conversationsRef = collection(firebaseFireStore, 'conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('userId', '==', userId),
      limit(1)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    if (conversationsSnapshot.empty) {
      // No conversation yet
      return {
        conversationId: null,
        messages: []
      };
    }
    
    const conversation = conversationsSnapshot.docs[0];
    const conversationId = conversation.id;
    
    // Get messages from conversation subcollection
    const messagesRef = collection(
      firebaseFireStore,
      'conversations',
      conversationId,
      'messages'
    );
    
    const messagesQuery = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(messageLimit)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    
    // Transform to match expected format (with createdAt instead of timestamp)
    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        content: data.content,
        createdAt: new Date(data.timestamp),
        ...(data.imageUrl && { imageUrl: data.imageUrl })
      };
    });
    
    return {
      conversationId,
      messages
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
    
    // console.log(`✅ Created conversation: ${conversationRef.id}`);
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
 * @param {string} message.role - 'user' or 'assistant'
 * @param {string} message.content - Message text content
 * @param {string} [message.imageUrl] - Optional image URL for user messages
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
    
    const messageData = {
      conversationId,
      role: message.role,
      content: message.content || '',
      timestamp: Date.now(),
      metadata: {}
    };

    // Add image URL if present
    if (message.imageUrl) {
      messageData.imageUrl = message.imageUrl;
    }
    
    await addDoc(messagesRef, messageData);
    
    // console.log(`💾 Saved ${message.role} message to Firestore${message.imageUrl ? ' (with image)' : ''}`);
  } catch (error) {
    console.error('Error saving message:', error);
    // Don't throw - we don't want to break the chat if save fails
  }
}

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - The conversation ID to delete
 */
export async function deleteConversation(conversationId) {
  try {
    // Delete all messages in the conversation
    const messagesRef = collection(
      firebaseFireStore,
      'conversations',
      conversationId,
      'messages'
    );
    
    const messagesSnapshot = await getDocs(messagesRef);
    const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
      deleteDoc(messageDoc.ref)
    );
    await Promise.all(deletePromises);
    
    // Delete the conversation document
    const conversationRef = doc(firebaseFireStore, 'conversations', conversationId);
    await deleteDoc(conversationRef);
    
    // console.log(`🗑️ Deleted conversation ${conversationId} and ${messagesSnapshot.size} messages`);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error; // Re-throw so caller knows it failed
  }
}

