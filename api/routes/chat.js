const express = require('express');
const { streamText, stepCountIs } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const { buildMessagesWithSystemPrompt, analyzeConversationContext } = require('../services/promptService');
const { z } = require('zod');

const router = express.Router();

// Initialize OpenAI with API key
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Task 1: Define tool schemas for canvas rendering
const canvasTools = {
  render_equation: {
    description: "Render a LaTeX equation on the canvas. Use this when introducing a new step, showing a worked example, or displaying an equation that should be visualized on the whiteboard.",
    inputSchema: z.object({
      latex: z.string().describe("LaTeX equation to render (e.g., 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'). Use the same LaTeX format as in chat messages ($...$ not needed here)."),
      x: z.number().optional().describe("X position on canvas (0-1000). Optional - if not provided, equations will auto-stack vertically."),
      y: z.number().optional().describe("Y position on canvas (0-1000). Optional - if not provided, equations will auto-stack vertically."),
    }),
  },
  render_label: {
    description: "Render a text label or annotation on the canvas. Use this for step numbers, instructions, or contextual notes that help explain the visualizations.",
    inputSchema: z.object({
      text: z.string().describe("Label text to display (e.g., 'Step 1: Set up the equation')"),
      x: z.number().optional().describe("X position on canvas (0-1000). Optional - if not provided, labels will auto-position."),
      y: z.number().optional().describe("Y position on canvas (0-1000). Optional - if not provided, labels will auto-position."),
      fontSize: z.number().optional().describe("Font size in pixels. Optional - defaults to 14."),
    }),
  },
  render_diagram: {
    description: "Render a geometric diagram or shape on the canvas. Use this for geometric problems, coordinate systems, graphs, or visual representations of mathematical concepts.",
    inputSchema: z.object({
      type: z.enum(['line', 'circle', 'rectangle', 'polygon', 'arrow', 'parabola']).describe("Type of diagram element to render"),
      points: z.array(
        z.object({
          x: z.number(),
          y: z.number(),
        })
      ).describe("Array of points defining the shape. For lines: start and end points. For circles: center and point on circumference. For rectangles: top-left and bottom-right. For polygons: all vertices. For arrows: start and end points."),
      strokeColor: z.string().optional().describe("Stroke color (e.g., '#000000'). Optional - defaults to black."),
      fillColor: z.string().optional().describe("Fill color (e.g., '#FF0000'). Optional - for shapes that should be filled."),
      strokeWidth: z.number().optional().describe("Line width in pixels. Optional - defaults to 2."),
    }),
  },
  clear_canvas: {
    description: "Clear all previous step visualizations from the canvas. Use this at the start of a new problem or when starting a completely new step. This only clears system-rendered content, not user drawings.",
    inputSchema: z.object({}),
  },
};

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


    // Stream the response from OpenAI using Vercel AI SDK with Socratic prompting and tool calling
    // maxToolRoundtrips allows the model to call tools AND then continue with text response
    const result = streamText({
      model: modelToUse,
      messages: messagesWithPrompt,
      temperature: 0.7,
      tools: canvasTools,
      stopWhen: [stepCountIs(5)],
    });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Use fullStream to get text deltas and tool calls
    // Format as SSE (Server-Sent Events) for the frontend
    try {
      for await (const chunk of result.fullStream) {
        // Log tool calls and step finishes for debugging
        if (chunk.type === 'tool-call') {
          console.log('🔧 Tool call:', chunk.toolName, 'with', Object.keys(chunk.args || {}).length, 'args');
        } else if (chunk.type === 'finish-step') {
          console.log('✅ Step finished:', chunk.finishReason, '- Usage:', chunk.usage?.totalTokens, 'tokens');
        }
        
        // Send each chunk as SSE data
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.end();
      console.log('🏁 Stream completed');
    } catch (streamError) {
      console.error('Stream error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming error' });
      }
    }

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

