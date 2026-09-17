export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network unavailable or server unreachable') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

const env = (import.meta as any).env || {};
const API_BASE_URL = env.VITE_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Core fetch wrapper with timeout, JSON parsing, and unified error handling.
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { timeoutMs = 10000, headers, ...restOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle standard HTTP error statuses securely
    if (!response.ok) {
      const status = response.status;
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      // Safe error mapping to prevent exposing backend stack traces
      let safeMessage = 'An unexpected error occurred';
      if (status === 400) safeMessage = errorData.message || 'Bad Request';
      else if (status === 404) safeMessage = 'Resource not found';
      else if (status === 409) safeMessage = errorData.message || 'Conflict detected';
      else if (status >= 500) safeMessage = 'Internal Server Error';
      
      throw new ApiError(safeMessage, status, errorData);
    }

    // 204 No Content handling
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;

  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new TimeoutError();
    }
    
    if (error instanceof ApiError) {
      throw error;
    }

    // Treat other TypeError (like failed to fetch) as network issues
    throw new NetworkError(error.message);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
  patch: <T>(endpoint: string, data: any, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    
  delete: <T>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Expose safe environment variables for components
export const config = {
  demoPatientId: env.VITE_DEMO_PATIENT_ID || '',
  demoFacilityId: env.VITE_DEMO_FACILITY_ID || '',
};
