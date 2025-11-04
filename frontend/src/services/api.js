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

export { API_URL };

