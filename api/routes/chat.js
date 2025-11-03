import express from 'express';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const router = express.Router();

// Initialize OpenAI with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chat - Handle chat messages with streaming
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Verify user is authenticated (middleware should set req.user)
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Stream the response from OpenAI using Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
    });

    // Convert to data stream response format expected by useChat hook
    return result.toDataStreamResponse(res);

  } catch (error) {
    console.error('Chat API error:', error);
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error.message 
      });
    }
  }
});

export default router;

