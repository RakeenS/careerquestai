/**
 * CORS Proxy Utility
 * 
 * This module provides utility functions for making cross-origin requests,
 * handling the complexities of CORS in different environments.
 */

// Helper to determine if running in development environment
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true;
};

/**
 * Fetch wrapper that handles CORS issues gracefully
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export const corsProxyFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Add a cache-busting parameter to avoid iOS caching issues
  const urlWithCacheBuster = new URL(url);
  urlWithCacheBuster.searchParams.append('_t', Date.now().toString());
  
  // Add necessary CORS headers for all requests
  const corsOptions: RequestInit = {
    ...options,
    mode: 'cors',
    cache: 'no-cache',  // Helps with iOS Safari caching issues
    credentials: 'omit', // Avoid cookie issues
    headers: {
      ...options.headers,
      'Accept': 'application/json',
    },
  };
  
  try {
    // First, try direct request
    const response = await fetch(urlWithCacheBuster.toString(), corsOptions);
    return response;
  } catch (error) {
    console.error('Direct fetch failed, trying backup method:', error);
    
    // If direct request fails, try through a CORS proxy for development
    if (isDevelopment()) {
      const corsProxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
      try {
        const proxyResponse = await fetch(corsProxyUrl, {
          ...corsOptions,
          // The proxy may need different headers
          headers: {
            ...corsOptions.headers,
            'Origin': window.location.origin,
          }
        });
        return proxyResponse;
      } catch (proxyError) {
        console.error('Proxy fetch also failed:', proxyError);
        throw new Error('Failed to connect to server. Please check your internet connection and try again.');
      }
    }
    
    // In production, rethrow original error
    throw error;
  }
};

/**
 * Makes a POST request with JSON body, handling CORS issues
 * 
 * @param url The URL to post to
 * @param data The data to send in the request body
 * @returns Promise with the parsed JSON response
 */
export const corsProxyPost = async <T = any>(url: string, data: any): Promise<T> => {
  const response = await corsProxyFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned ${response.status}: ${errorText}`);
  }
  
  return response.json();
};

/**
 * Makes a GET request, handling CORS issues
 * 
 * @param url The URL to fetch from
 * @returns Promise with the parsed JSON response
 */
export const corsProxyGet = async <T = any>(url: string): Promise<T> => {
  const response = await corsProxyFetch(url, {
    method: 'GET',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server returned ${response.status}: ${errorText}`);
  }
  
  return response.json();
};
