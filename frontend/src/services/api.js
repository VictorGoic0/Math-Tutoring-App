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
 * Handles streaming responses from /chat endpoint.
 * Backend uses `toTextStreamResponse()` which sends plain text chunks.
 * 
 * @param {Response} response - Fetch response with streaming body
 * @param {Function} onChunk - Callback for each text chunk: (text: string) => void
 * @param {Function} onComplete - Callback when stream completes: (fullText: string) => void
 * @param {Function} onError - Callback for errors: (error: Error) => void
 * 
 * @example
 * const response = await fetch('/chat', {...});
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

export { API_URL };

