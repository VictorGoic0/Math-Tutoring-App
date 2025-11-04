/**
 * Chat Service
 * API calls related to chat functionality
 */

import { apiGet } from './api';

/**
 * Load conversation history for the authenticated user
 * 
 * @param {string} authToken - Firebase auth token
 * @param {number} limit - Maximum number of messages to load (default: 100)
 * @returns {Promise<Array>} Array of messages
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
    return data.messages || [];
  } catch (error) {
    console.error('Error loading conversation history:', error);
    throw error;
  }
}

/**
 * Get user's conversations (for future multi-conversation support)
 * 
 * @param {string} authToken - Firebase auth token
 * @param {number} limit - Maximum number of conversations to load
 * @returns {Promise<Array>} Array of conversations
 */
export async function getUserConversations(authToken, limit = 50) {
  try {
    const response = await apiGet(
      `/api/conversations?limit=${limit}`,
      authToken
    );

    if (!response.ok) {
      throw new Error(`Failed to load conversations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    throw error;
  }
}

/**
 * Delete user's current conversation
 * 
 * @param {string} authToken - Firebase auth token
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteCurrentConversation(authToken) {
  try {
    // First, get user's conversations to find the conversation ID
    const conversations = await getUserConversations(authToken, 1);
    
    if (conversations.length === 0) {
      // No conversation to delete
      return false;
    }

    const conversationId = conversations[0].id;
    
    // Delete the conversation
    const { apiDelete } = await import('./api');
    const response = await apiDelete(
      `/api/conversations/${conversationId}`,
      authToken
    );

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

