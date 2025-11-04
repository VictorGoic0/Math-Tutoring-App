const express = require('express');
const { streamText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const { buildMessagesWithSystemPrompt, analyzeConversationContext } = require('../services/promptService');

const router = express.Router();

// Initialize OpenAI with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /chat - Handle chat messages with streaming
router.post('/chat', async (req, res) => {
  try {
    const { messages, imageUrl } = req.body;

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

    // Log if image is included in request
    // if (imageUrl) {
    //   console.log(`📷 Image included in chat request: ${imageUrl.substring(0, 80)}...`);
    // }

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
    //   messageCount: messages.length,
    //   problemText: context.problemText.substring(0, 50) + (context.problemText.length > 50 ? '...' : ''),
    //   currentStep: context.currentStep,
    //   studentUnderstanding: context.studentUnderstanding,
    //   stuckTurns: context.stuckTurns,
    //   hintsGiven: context.hintsGiven
    // });

    // Build messages with Socratic system prompt and adaptive scaffolding
    // If imageUrl is present, add it to the last user message
    const processedMessages = messages.map((msg, index) => {
      // Check if this is the last user message and we have an imageUrl
      const isLastUserMessage = index === messages.length - 1 && msg.role === 'user';
      const shouldAddImage = isLastUserMessage && imageUrl;

      if (shouldAddImage) {
        // Format message content for vision (multi-part content)
        return {
          role: msg.role,
          content: [
            {
              type: 'text',
              text: msg.content || 'Please help me solve this math problem from the image.'
            },
            {
              type: 'image',
              image: imageUrl
            }
          ]
        };
      }

      // Regular text-only message
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const messagesWithPrompt = buildMessagesWithSystemPrompt(processedMessages);

    // Use vision model if image is present, otherwise use regular model
    // Note: gpt-4o has native vision support, gpt-4-turbo for text-only
    const modelToUse = imageUrl ? openai('gpt-4o') : openai('gpt-4-turbo');
    
    // console.log(`🤖 Using model: ${imageUrl ? 'gpt-4o (with vision)' : 'gpt-4-turbo (text-only)'}`);


    // Stream the response from OpenAI using Vercel AI SDK with Socratic prompting
    const result = streamText({
      model: modelToUse,
      messages: messagesWithPrompt,
      temperature: 0.7,
    });

    // Stream plain text response to client (v5: pipes to Express response)
    // Note: Persistence handled by frontend state + history reload (simple & reliable)
    result.pipeTextStreamToResponse(res);

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

module.exports = router;

