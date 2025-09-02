import OpenAI from 'openai';
import { supabase } from './supabaseClient';

// Helper to get the correct API key based on environment
const getApiKey = () => {
  // In production (Vercel), use non-prefixed environment variables
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // This is for client-side in production where we should use the proxy anyway
    return 'dummy-key-production-uses-proxy';
  }
  
  // In development, use VITE prefixed environment variables
  return import.meta.env.VITE_OPENAI_API_KEY;
};

// Helper to get the correct Helicone key based on environment
const getHeliconeKey = () => {
  // In production (Vercel), use non-prefixed environment variables
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // This is for client-side in production where we should use the proxy anyway
    return 'dummy-key-production-uses-proxy';
  }
  
  // In development, use VITE prefixed environment variables
  return import.meta.env.VITE_HELICONE_API_KEY;
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true,
  baseURL: "https://oai.hconeai.com/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${getHeliconeKey()}`
  },
  maxRetries: 3,
  timeout: 60000 // 60 seconds timeout - more forgiving for mobile networks
});

// Mobile browser detection helper
export const isMobileDevice = () => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
};

// iOS device detection helper
export const isIOSDevice = () => {
  return /iphone|ipad|ipod/i.test(
    navigator.userAgent.toLowerCase()
  );
};

// Get the appropriate backend URL based on environment
export const getBackendUrl = () => {
  // In production (deployed to Vercel), use relative path for API routes
  const isProduction = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // Use empty string to make API calls relative to the current domain
    // This ensures we're using the Vercel serverless functions in the same domain
    console.log('Production environment detected, using relative API path');
    return '';
  }
  
  // Use environment variable if available (preferred for development)
  if (import.meta.env.VITE_API_URL) {
    console.log('Using API URL from environment variable:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback for development
  const devBackendUrl = 'https://resume-builder-backend-ry5e.onrender.com';
  console.log('Using fallback development backend URL:', devBackendUrl);
  return devBackendUrl;
};

// Define a type for our proxy client to match OpenAI's structure
export type ProxyOpenAIClient = {
  chat: {
    completions: {
      create: (payload: any) => Promise<any>;
    }
  }
};

// Mobile-friendly OpenAI client that routes requests through backend proxy
export const createProxyOpenAIClient = (): ProxyOpenAIClient => {
  const backendUrl = getBackendUrl();
  
  // Create a custom client for mobile devices that routes requests through the backend
  const proxyClient: ProxyOpenAIClient = {
    chat: {
      completions: {
        create: async (payload: any) => {
          try {
            console.log('Using proxy OpenAI client with backend URL:', backendUrl);
            
            // Add timestamp to avoid cache issues on iOS
            const timestamp = new Date().getTime();
            
            // In production (empty backendUrl), use /api path directly
            const apiPath = backendUrl ? `${backendUrl}/api/openai-proxy` : '/api/openai-proxy';
            console.log(`Making OpenAI proxy request to: ${apiPath}?_t=${timestamp}`);
            
            const response = await fetch(`${apiPath}?_t=${timestamp}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                endpoint: 'chat.completions',
                payload
              }),
              // Add these options for better mobile browser compatibility
              mode: 'cors',
              credentials: 'omit',
              cache: 'no-cache',
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Error response from proxy server:', errorText);
              throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
              throw new Error(result.error || 'Failed to process OpenAI request');
            }
            
            return result.data;
          } catch (error) {
            console.error('Error with proxy OpenAI request:', error);
            throw error;
          }
        }
      }
    }
  };
  
  return proxyClient;
};

// Helper for optimizing professional summaries through the server
export const optimizeProfessionalSummary = async (
  content: string, 
  userId: string, 
  options?: { customPrompt?: string }
): Promise<{optimizedContent: string}> => {
  try {
    console.log('Using optimize summary endpoint...');
    
    // Add timestamp to prevent caching issues on Safari
    const timestamp = new Date().getTime();
    const apiPath = `/api/optimize-summary?_t=${timestamp}`;
    
    // Use relative URL path for deployed site or full URL for development
    const backendUrl = getBackendUrl();
    const apiUrl = backendUrl ? `${backendUrl}${apiPath}` : apiPath;
    
    console.log(`Making summary optimization request to: ${apiUrl}`);
    
    // Allow a custom prompt to be passed in
    const prompt = options?.customPrompt || "Pretend you are a professional resume writer and rewrite this for a professional summary section on a resume";
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        content,
        userId,
        prompt
      }),
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from summary optimization:', errorText);
      throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to optimize summary');
    }
    
    return { optimizedContent: result.data.optimizedContent };
  } catch (error) {
    console.error('Error optimizing summary:', error);
    throw error;
  }
};

// Ensure OpenAI calls work in different environments, especially on mobile devices
export const getOpenAIClient = async (): Promise<OpenAI | ProxyOpenAIClient> => {
  const isMobile = isMobileDevice();
  const isIOS = isIOSDevice();
  
  console.log(`Selecting OpenAI client - Mobile: ${isMobile}, iOS: ${isIOS}, Hostname: ${window.location.hostname}`);
  
  // For production environment, always use serverless functions
  if (window.location.hostname !== 'localhost') {
    console.log('Production environment detected, using serverless function proxy');
    return createProxyOpenAIClient();
  }
  
  // Always use the proxy for iOS devices
  if (isIOS) {
    return createProxyOpenAIClient();
  }
  
  // For other mobile devices, also use proxy
  if (isMobile) {
    return createProxyOpenAIClient();
  }
  
  // For desktop browsers in development, use the direct OpenAI client
  return openai;
};

// Initialize API usage for a user if it doesn't exist
const initializeApiUsage = async (userId: string) => {
  try {
    // Check if user already has an API usage record
    const { error } = await supabase
      .from('api_usage')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    // If no record exists, create one
    if (error && error.code === 'PGRST116') {
      const resetDate = new Date();
      resetDate.setHours(0, 0, 0, 0); // Set to beginning of current day
      resetDate.setDate(resetDate.getDate() + 1); // Set to next day
      
      await supabase
        .from('api_usage')
        .insert({
          user_id: userId,
          calls_count: 0,
          last_reset: resetDate.toISOString()
        });
    } else if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error initializing API usage:', error);
  }
};

export const checkAndIncrementUsage = async (userId: string): Promise<boolean> => {
  try {
    await initializeApiUsage(userId);
    const { data, error } = await supabase
      .rpc('check_api_usage', { user_id: userId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking API usage:', error);
    return false;
  }
};

export const getApiUsage = async (userId: string) => {
  try {
    await initializeApiUsage(userId);
    const { data, error } = await supabase
      .from('api_usage')
      .select('calls_count, last_reset')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting API usage:', error);
    return null;
  }
};

export default openai;