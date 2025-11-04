/**
 * Firestore Service
 * Handles all Firestore operations for conversation and message persistence
 */

const { db } = require('../utils/firebaseAdmin');

/**
 * FIRESTORE COLLECTION STRUCTURE
 * 
 * /conversations/{conversationId}
 *   - id: string (auto-generated)
 *   - userId: string
 *   - title: string (first 50 chars of first message or "New Conversation")
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 *   - messageCount: number
 *   - lastMessage: string (preview of last message)
 * 
 * /conversations/{conversationId}/messages/{messageId}
 *   - id: string (auto-generated)
 *   - conversationId: string
 *   - role: 'user' | 'assistant' | 'system'
 *   - content: string
 *   - timestamp: timestamp
 *   - metadata: object (optional - for images, context, etc.)
 */

/**
 * CONVERSATION DATA MODEL
 * 
 * @typedef {Object} Conversation
 * @property {string} id - Unique conversation identifier
 * @property {string} userId - Firebase Auth user ID
 * @property {string} title - Conversation title (derived from first message)
 * @property {number} createdAt - Unix timestamp (milliseconds)
 * @property {number} updatedAt - Unix timestamp (milliseconds)
 * @property {number} messageCount - Total number of messages
 * @property {string} lastMessage - Preview of the most recent message
 */

/**
 * MESSAGE DATA MODEL
 * 
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} conversationId - Parent conversation ID
 * @property {string} role - Message role: 'user', 'assistant', or 'system'
 * @property {string} content - Message text content
 * @property {number} timestamp - Unix timestamp (milliseconds)
 * @property {Object} [metadata] - Optional metadata (images, context, etc.)
 * @property {string[]} [metadata.imageUrls] - Array of image URLs if message has images
 * @property {Object} [metadata.context] - Conversation context snapshot at this message
 */

// Collection references
const COLLECTIONS = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages' // Subcollection under conversations
};

/**
 * Create a new conversation document
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {string} [firstMessage] - First message content to derive title
 * @returns {Promise<Object>} Created conversation document with ID
 */
async function createConversation(userId, firstMessage = '') {
  try {
    const now = Date.now();
    
    // Generate title from first message (first 50 chars)
    const title = firstMessage
      ? firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
      : 'New Conversation';
    
    const conversationData = {
      userId,
      title,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      lastMessage: ''
    };
    
    // Create document and get reference
    const docRef = await db.collection(COLLECTIONS.CONVERSATIONS).add(conversationData);
    
    return {
      id: docRef.id,
      ...conversationData
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
}

/**
 * Get a conversation by ID
 * 
 * @param {string} conversationId - Conversation document ID
 * @param {string} userId - User ID to verify ownership
 * @returns {Promise<Object|null>} Conversation document or null if not found
 */
async function getConversation(conversationId, userId) {
  try {
    const doc = await db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const conversation = { id: doc.id, ...doc.data() };
    
    // Verify user owns this conversation
    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }
    
    return conversation;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
}

/**
 * Get all conversations for a user
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {number} [limit=50] - Maximum number of conversations to return
 * @returns {Promise<Array>} Array of conversation documents, sorted by updatedAt desc
 */
async function getUserConversations(userId, limit = 50) {
  try {
    const snapshot = await db.collection(COLLECTIONS.CONVERSATIONS)
      .where('userId', '==', userId)
      .limit(limit)
      .get();
    
    const conversations = [];
    snapshot.forEach(doc => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory instead of in query (avoids need for composite index)
    conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw new Error(`Failed to get user conversations: ${error.message}`);
  }
}

/**
 * Update conversation metadata (title, lastMessage, etc.)
 * 
 * @param {string} conversationId - Conversation document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateConversation(conversationId, updates) {
  try {
    await db.collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .update({
        ...updates,
        updatedAt: Date.now()
      });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw new Error(`Failed to update conversation: ${error.message}`);
  }
}

/**
 * Delete a conversation and all its messages
 * 
 * @param {string} conversationId - Conversation document ID
 * @param {string} userId - User ID to verify ownership
 * @returns {Promise<void>}
 */
async function deleteConversation(conversationId, userId) {
  try {
    // Verify ownership first
    const conversation = await getConversation(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Delete all messages in the conversation
    const messagesSnapshot = await db.collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .collection(COLLECTIONS.MESSAGES)
      .get();
    
    const batch = db.batch();
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the conversation document
    batch.delete(db.collection(COLLECTIONS.CONVERSATIONS).doc(conversationId));
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}

/**
 * Add a message to a conversation
 * 
 * @param {string} conversationId - Parent conversation ID
 * @param {Object} messageData - Message data
 * @param {string} messageData.role - 'user' | 'assistant' | 'system'
 * @param {string} messageData.content - Message text content
 * @param {Object} [messageData.metadata] - Optional metadata
 * @returns {Promise<Object>} Created message document with ID
 */
async function addMessage(conversationId, messageData) {
  try {
    const { role, content, metadata = {} } = messageData;
    
    const message = {
      conversationId,
      role,
      content,
      timestamp: Date.now(),
      metadata
    };
    
    // Add message to subcollection
    const docRef = await db.collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .collection(COLLECTIONS.MESSAGES)
      .add(message);
    
    // Update conversation metadata
    await updateConversation(conversationId, {
      lastMessage: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      messageCount: db.FieldValue.increment(1)
    });
    
    return {
      id: docRef.id,
      ...message
    };
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error(`Failed to add message: ${error.message}`);
  }
}

/**
 * Get all messages for a conversation
 * 
 * @param {string} conversationId - Conversation document ID
 * @param {number} [limit=100] - Maximum number of messages to return
 * @returns {Promise<Array>} Array of message documents, sorted by timestamp asc
 */
async function getMessages(conversationId, limit = 100) {
  try {
    const snapshot = await db.collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .collection(COLLECTIONS.MESSAGES)
      .orderBy('timestamp', 'asc')
      .limit(limit)
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error(`Failed to get messages: ${error.message}`);
  }
}

/**
 * Get recent messages for a conversation (useful for pagination)
 * 
 * @param {string} conversationId - Conversation document ID
 * @param {number} [limit=50] - Number of recent messages to return
 * @returns {Promise<Array>} Array of recent message documents, sorted by timestamp desc
 */
async function getRecentMessages(conversationId, limit = 50) {
  try {
    const snapshot = await db.collection(COLLECTIONS.CONVERSATIONS)
      .doc(conversationId)
      .collection(COLLECTIONS.MESSAGES)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error getting recent messages:', error);
    throw new Error(`Failed to get recent messages: ${error.message}`);
  }
}

module.exports = {
  // Collection constants
  COLLECTIONS,
  
  // Conversation operations
  createConversation,
  getConversation,
  getUserConversations,
  updateConversation,
  deleteConversation,
  
  // Message operations
  addMessage,
  getMessages,
  getRecentMessages
};

