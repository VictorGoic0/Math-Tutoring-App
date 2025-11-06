/**
 * Base API Client
 * Centralized API configuration and request handling
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Base fetch wrapper
 * 
 * @param {string} endpoint - API endpoint (e.g., '/chat')
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * GET request
 */
export async function apiGet(endpoint) {
  return apiFetch(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost(endpoint, data) {
  return apiFetch(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * PATCH request
 */
export async function apiPatch(endpoint, data) {
  return apiFetch(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: 'DELETE' });
}

/**
 * Parse AI stream response (Plain text stream)
 * 
 * Handles plain text streaming responses (legacy format).
 * Backend uses `pipeTextStreamToResponse()` which sends plain text chunks.
 * 
 * @param {Response} response - Fetch response with streaming body
 * @param {Function} onChunk - Callback for each text chunk: (text: string) => void
 * @param {Function} onComplete - Callback when stream completes: (fullText: string) => void
 * @param {Function} onError - Callback for errors: (error: Error) => void
 */
export async function parseAIStreamText(response, onChunk, onComplete, onError) {
  if (!response.ok) {
    const errorText = await response.text();
    onError(new Error(`API error: ${response.status} - ${errorText}`));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete(fullText);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      
      if (onChunk) {
        onChunk(chunk);
      }
    }
  } catch (error) {
    onError(error);
  }
}

/**
 * Parse AI stream response (Data stream with tool calls)
 * 
 * Handles SSE (Server-Sent Events) format with text deltas and tool calls.
 * Backend uses fullStream which sends structured events.
 * 
 * SSE Format:
 * data: {"type":"text-delta","text":"hello"}
 * data: {"type":"tool-call","toolCallId":"...","toolName":"render_equation","args":{...}}
 * 
 * @param {Response} response - Fetch response with streaming body
 * @param {Function} onChunk - Callback for each text chunk: (text: string) => void
 * @param {Function} onComplete - Callback when stream completes: (fullText: string, toolCalls: Array) => void
 * @param {Function} onError - Callback for errors: (error: Error) => void
 */
export async function parseAIStreamRender(response, onChunk, onComplete, onError) {
  // console.log('🎬 parseAIStreamRender: Starting to parse data stream');
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ parseAIStreamRender: Response not OK:', response.status, errorText);
    onError(new Error(`API error: ${response.status} - ${errorText}`));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let toolCalls = [];
  let buffer = '';
  let chunkCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // console.log('✅ parseAIStreamRender: Stream complete', {
        //   totalChunks: chunkCount,
        //   textLength: fullText.length,
        //   toolCallCount: toolCalls.length,
        //   toolCalls: toolCalls.map(tc => ({ name: tc.toolName, hasArgs: !!tc.args }))
        // });
        onComplete(fullText, toolCalls);
        break;
      }

      chunkCount++;
      
      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines (SSE format: "data: {...}\n\n")
      const lines = buffer.split('\n');
      
      // Keep last incomplete line in buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) {
          continue;
        }
        
        // Parse SSE data line
        const jsonStr = line.slice(6); // Remove "data: " prefix
        
        try {
          const event = JSON.parse(jsonStr);
          
          // Handle different event types
          if (event.type === 'text-delta' && event.text) {
            // console.log('📝 Text delta:', event.text.substring(0, 50) + (event.text.length > 50 ? '...' : ''));
            
            // Accumulate text
            fullText += event.text;
            
            // Stream text chunk to UI
            if (onChunk) {
              onChunk(event.text);
            }
          } else if (event.type === 'tool-call') {
            // Accumulate tool call
            // AI SDK uses 'input' or 'args' depending on version/format
            const toolArgs = event.args || event.input;
            
            // console.log('🔧 Tool call received:', {
            //   toolName: event.toolName,
            //   toolCallId: event.toolCallId,
            //   argsKeys: toolArgs ? Object.keys(toolArgs) : [],
            //   args: toolArgs
            // });
            
            toolCalls.push({
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              args: toolArgs
            });
          } else if (event.type === 'tool-call-delta') {
            // console.log('🔧 Tool call delta:', event.toolCallId);
            
            // Handle incremental tool call args (if streaming)
            const existingCall = toolCalls.find(tc => tc.toolCallId === event.toolCallId);
            if (existingCall) {
              // Merge args delta
              const argsDelta = event.args || event.argsTextDelta;
              existingCall.args = { ...existingCall.args, ...argsDelta };
            }
          } else if (event.type === 'finish-step') {
            console.log('🏁 Step finished:', {
              finishReason: event.finishReason,
              usage: event.usage,
              hasToolCalls: toolCalls.length > 0,
              textLength: fullText.length
            });
          } else if (event.type === 'start-step') {
            console.log('🎬 New step starting');
          } else {
            console.log('ℹ️ Other event type:', event.type);
          }
          // Ignore other event types (text-start, text-end, finish, etc.)
        } catch (parseError) {
          console.warn('⚠️ Failed to parse SSE event:', jsonStr, parseError);
        }
      }
    }
  } catch (error) {
    console.error('❌ parseAIStreamRender: Error during parsing:', error);
    onError(error);
  }
}

/**
 * Parse AI stream response (Wrapper)
 * 
 * Detects stream type and delegates to appropriate parser:
 * - Plain text stream → parseAIStreamText
 * - SSE data stream → parseAIStreamRender
 * 
 * @param {Response} response - Fetch response with streaming body
 * @param {Function} onChunk - Callback for each text chunk: (text: string) => void
 * @param {Function} onComplete - Callback when stream completes
 * @param {Function} onError - Callback for errors: (error: Error) => void
 * 
 * @example
 * const response = await fetch('/chat', {...});
 * parseAIStream(response, 
 *   (chunk) => console.log('Chunk:', chunk),
 *   (fullText, toolCalls) => console.log('Complete:', fullText, toolCalls),
 *   (err) => console.error(err)
 * );
 */
export async function parseAIStream(response, onChunk, onComplete, onError) {
  // Check Content-Type to determine stream format
  const contentType = response.headers.get('Content-Type');
  
  if (contentType && contentType.includes('text/event-stream')) {
    // SSE format with tool calls (data stream)
    return parseAIStreamRender(response, onChunk, onComplete, onError);
  } else {
    // Plain text stream (legacy)
    // Wrap onComplete to match new signature (add empty toolCalls array)
    const wrappedOnComplete = (fullText) => onComplete(fullText, []);
    return parseAIStreamText(response, onChunk, wrappedOnComplete, onError);
  }
}

export { API_URL };

