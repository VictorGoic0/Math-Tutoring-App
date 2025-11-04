const express = require('express');
const {
  createConversation,
  getConversation,
  getUserConversations,
  updateConversation,
  deleteConversation,
  addMessage,
  getMessages,
  getRecentMessages
} = require('../services/firestoreService');

const router = express.Router();

/**
 * POST /api/conversations
 * Create a new conversation
 * 
 * Body: { firstMessage?: string }
 * Returns: { conversation: { id, userId, title, createdAt, updatedAt, messageCount, lastMessage } }
 */
router.post('/conversations', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const { firstMessage } = req.body;
    
    // Create conversation
    const conversation = await createConversation(req.user.uid, firstMessage || '');
    
    res.status(201).json({
      conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create conversation',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 * 
 * Query params: limit (optional, default 50)
 * Returns: { conversations: [...] }
 */
router.get('/conversations', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    
    // Get user's conversations
    const conversations = await getUserConversations(req.user.uid, limit);
    
    res.status(200).json({
      conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get conversations',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * GET /api/conversations/:id
 * Get a specific conversation by ID
 * 
 * Returns: { conversation: {...} }
 */
router.get('/conversations/:id', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    
    // Get conversation (includes ownership check)
    const conversation = await getConversation(id, req.user.uid);
    
    if (!conversation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }
    
    res.status(200).json({
      conversation
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    
    // Handle unauthorized access
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this conversation'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get conversation',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * PATCH /api/conversations/:id
 * Update a conversation (title, etc.)
 * 
 * Body: { title?: string }
 * Returns: { success: true }
 */
router.patch('/conversations/:id', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const { title } = req.body;
    
    // Verify ownership first
    const conversation = await getConversation(id, req.user.uid);
    if (!conversation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }
    
    // Update conversation
    const updates = {};
    if (title !== undefined) updates.title = title;
    
    await updateConversation(id, updates);
    
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this conversation'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update conversation',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation and all its messages
 * 
 * Returns: { success: true }
 */
router.delete('/conversations/:id', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    
    // Delete conversation (includes ownership check)
    await deleteConversation(id, req.user.uid);
    
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this conversation'
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete conversation',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * GET /api/conversations/:id/messages
 * Get all messages for a conversation
 * 
 * Query params: limit (optional, default 100), recent (optional, boolean)
 * Returns: { messages: [...] }
 */
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const recent = req.query.recent === 'true';
    
    // Verify ownership first
    const conversation = await getConversation(id, req.user.uid);
    if (!conversation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }
    
    // Get messages
    const messages = recent
      ? await getRecentMessages(id, limit)
      : await getMessages(id, limit);
    
    res.status(200).json({
      messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this conversation'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get messages',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Add a message to a conversation
 * 
 * Body: { role: 'user' | 'assistant' | 'system', content: string, metadata?: object }
 * Returns: { message: {...} }
 */
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const { role, content, metadata } = req.body;
    
    // Validate message data
    if (!role || !content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'role and content are required'
      });
    }
    
    if (!['user', 'assistant', 'system'].includes(role)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'role must be one of: user, assistant, system'
      });
    }
    
    // Verify ownership first
    const conversation = await getConversation(id, req.user.uid);
    if (!conversation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }
    
    // Add message
    const message = await addMessage(id, { role, content, metadata });
    
    res.status(201).json({
      message
    });
  } catch (error) {
    console.error('Error adding message:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have access to this conversation'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add message',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

module.exports = router;

