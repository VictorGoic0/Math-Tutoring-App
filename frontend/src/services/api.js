/**
 * Base API Client
 * Centralized API configuration and request handling
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Base fetch wrapper with authentication
 * 
 * @param {string} endpoint - API endpoint (e.g., '/api/chat/history')
 * @param {Object} options - Fetch options
 * @param {string} authToken - Firebase auth token
 * @returns {Promise<Response>} Fetch response
 */
async function apiFetch(endpoint, options = {}, authToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

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
export async function apiGet(endpoint, authToken = null) {
  return apiFetch(endpoint, { method: 'GET' }, authToken);
}

/**
 * POST request
 */
export async function apiPost(endpoint, data, authToken = null) {
  return apiFetch(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    authToken
  );
}

/**
 * PATCH request
 */
export async function apiPatch(endpoint, data, authToken = null) {
  return apiFetch(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    authToken
  );
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint, authToken = null) {
  return apiFetch(endpoint, { method: 'DELETE' }, authToken);
}

/**
 * Parse AI stream response (Vercel AI SDK v3 format)
 * 
 * Handles streaming responses from /api/chat endpoint.
 * Backend uses `pipeDataStreamToResponse` which sends in format: "0:chunk"
 * 
 * @param {Response} response - Fetch response with streaming body
 * @param {Function} onChunk - Callback for each text chunk: (text: string) => void
 * @param {Function} onComplete - Callback when stream completes: (fullText: string) => void
 * @param {Function} onError - Callback for errors: (error: Error) => void
 * 
 * @example
 * const response = await fetch('/api/chat', {...});
 * parseAIStream(response, 
 *   (chunk) => console.log('Chunk:', chunk),
 *   (full) => console.log('Complete:', full),
 *   (err) => console.error(err)
 * );
 */
export async function parseAIStream(response, onChunk, onComplete, onError) {
  if (!response.ok) {
    const errorText = await response.text();
    onError(new Error(`API error: ${response.status} - ${errorText}`));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete(fullText);
        break;
      }

      // Decode the chunk
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        // Vercel AI SDK v3 format: "0:text chunk" for text deltas
        if (line.startsWith('0:')) {
          const text = line.slice(2); // Remove "0:" prefix
          if (text) {
            fullText += text;
            onChunk(text);
          }
        }
        // Also support standard SSE format as fallback
        else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullText += parsed.content;
              onChunk(parsed.content);
            } else if (typeof parsed === 'string') {
              fullText += parsed;
              onChunk(parsed);
            }
          } catch {
            // Plain text
            fullText += data;
            onChunk(data);
          }
        }
      }
    }
  } catch (error) {
    onError(error);
  }
}

export { API_URL };

