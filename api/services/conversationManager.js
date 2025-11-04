/**
 * Conversation Manager
 * Handles single-conversation-per-user logic and message persistence
 */

const {
  createConversation,
  getUserConversations,
  addMessage,
  getMessages
} = require('./firestoreService');

/**
 * Get or create the user's conversation
 * For MVP: Each user has ONE conversation. If it doesn't exist, create it.
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {string} [firstMessage] - First message to set as title if creating new conversation
 * @returns {Promise<Object>} The user's conversation object
 */
async function getOrCreateUserConversation(userId, firstMessage = '') {
  try {
    // Check if user already has a conversation
    const conversations = await getUserConversations(userId, 1);
    
    if (conversations.length > 0) {
      // Return existing conversation
      return conversations[0];
    }
    
    // No conversation exists, create one
    const conversation = await createConversation(userId, firstMessage);
    console.log(`✅ Created new conversation for user ${userId}: ${conversation.id}`);
    
    return conversation;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw new Error(`Failed to get or create conversation: ${error.message}`);
  }
}

/**
 * Persist a user message to Firestore
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {string} content - Message content
 * @param {Object} [metadata] - Optional metadata
 * @returns {Promise<Object>} Saved message object
 */
async function persistUserMessage(userId, content, metadata = {}) {
  try {
    // Get or create conversation
    const conversation = await getOrCreateUserConversation(userId, content);
    
    // Add message to conversation
    const message = await addMessage(conversation.id, {
      role: 'user',
      content,
      metadata
    });
    
    return message;
  } catch (error) {
    console.error('Error persisting user message:', error);
    throw new Error(`Failed to persist user message: ${error.message}`);
  }
}

/**
 * Persist an assistant message to Firestore
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {string} content - Message content
 * @param {Object} [metadata] - Optional metadata (e.g., context)
 * @returns {Promise<Object>} Saved message object
 */
async function persistAssistantMessage(userId, content, metadata = {}) {
  try {
    // Get conversation (should already exist since assistant responds to user)
    const conversation = await getOrCreateUserConversation(userId);
    
    // Add message to conversation
    const message = await addMessage(conversation.id, {
      role: 'assistant',
      content,
      metadata
    });
    
    return message;
  } catch (error) {
    console.error('Error persisting assistant message:', error);
    throw new Error(`Failed to persist assistant message: ${error.message}`);
  }
}

/**
 * Load conversation history for a user
 * Returns messages in format expected by useChat hook
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {number} [limit] - Max number of messages to load
 * @returns {Promise<Array>} Array of messages in useChat format
 */
async function loadConversationHistory(userId, limit = 100) {
  try {
    // Get user's conversation
    const conversations = await getUserConversations(userId, 1);
    
    if (conversations.length === 0) {
      // No conversation yet, return empty array
      return [];
    }
    
    const conversation = conversations[0];
    
    // Get messages from conversation
    const messages = await getMessages(conversation.id, limit);
    
    // Transform to useChat format (role, content, id)
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error loading conversation history:', error);
    throw new Error(`Failed to load conversation history: ${error.message}`);
  }
}

/**
 * Persist both user and assistant messages from a chat interaction
 * Call this after AI response is complete
 * 
 * @param {string} userId - Firebase Auth user ID
 * @param {string} userMessage - User's message content
 * @param {string} assistantMessage - Assistant's response content
 * @param {Object} [context] - Optional context metadata to save with assistant message
 * @returns {Promise<Object>} Object with both saved messages
 */
async function persistChatTurn(userId, userMessage, assistantMessage, context = null) {
  try {
    // Persist user message
    const savedUserMessage = await persistUserMessage(userId, userMessage);
    
    // Persist assistant message with optional context
    const metadata = context ? { context } : {};
    const savedAssistantMessage = await persistAssistantMessage(userId, assistantMessage, metadata);
    
    return {
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage
    };
  } catch (error) {
    console.error('Error persisting chat turn:', error);
    // Don't throw - we don't want to break the chat if persistence fails
    // Just log the error and continue
    return null;
  }
}

module.exports = {
  getOrCreateUserConversation,
  persistUserMessage,
  persistAssistantMessage,
  loadConversationHistory,
  persistChatTurn
};

