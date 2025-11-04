const express = require('express');
const { streamText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const { buildMessagesWithSystemPrompt, analyzeConversationContext } = require('../services/promptService');
const { loadConversationHistory } = require('../services/conversationManager');

const router = express.Router();

// Initialize OpenAI with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat - Handle chat messages with streaming
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Messages array is required' 
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Messages array cannot be empty' 
      });
    }

    // Verify user is authenticated (middleware should set req.user)
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'Configuration Error',
        message: 'OpenAI API key not configured' 
      });
    }

    // Analyze conversation context for logging and debugging
    // const context = analyzeConversationContext(messages);
    // console.log('📊 Conversation Context:', {
    //   userId: req.user.uid,
    //   messageCount: messages.length,
    //   problemText: context.problemText.substring(0, 50) + (context.problemText.length > 50 ? '...' : ''),
    //   currentStep: context.currentStep,
    //   studentUnderstanding: context.studentUnderstanding,
    //   stuckTurns: context.stuckTurns,
    //   hintsGiven: context.hintsGiven
    // });

    // Build messages with Socratic system prompt and adaptive scaffolding
    const messagesWithPrompt = buildMessagesWithSystemPrompt(
      messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    );

    // Stream the response from OpenAI using Vercel AI SDK with Socratic prompting
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages: messagesWithPrompt,
      temperature: 0.7,
    });

    // Stream response to client
    // Note: Persistence handled by frontend state + history reload (simple & reliable)
    result.pipeDataStreamToResponse(res);

  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error.stack);
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      // Handle specific OpenAI errors
      if (error.message?.includes('API key')) {
        return res.status(401).json({ 
          error: 'OpenAI Authentication Error',
          message: 'Invalid OpenAI API key'
        });
      }
      
      if (error.message?.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Rate Limit Exceeded',
          message: 'Too many requests, please try again later'
        });
      }

      if (error.message?.includes('quota')) {
        return res.status(402).json({ 
          error: 'Quota Exceeded',
          message: 'OpenAI API quota exceeded'
        });
      }

      // Generic error response
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'production' ? undefined : error.message
      });
    } else {
      // If streaming already started, log the error
      console.error('Error occurred after streaming started - connection may be broken');
    }
  }
});

/**
 * GET /api/chat/history
 * Load conversation history for the authenticated user
 * Returns messages in format compatible with useChat hook
 */
router.get('/chat/history', async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const limit = parseInt(req.query.limit) || 100;
    
    // Load conversation history
    const messages = await loadConversationHistory(req.user.uid, limit);
    
    res.status(200).json({
      messages
    });
  } catch (error) {
    console.error('Error loading conversation history:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to load conversation history',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

module.exports = router;

