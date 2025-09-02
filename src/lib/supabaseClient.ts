import { createClient } from '@supabase/supabase-js'

// Use the actual values directly for immediate testing
const supabaseUrl = 'https://ygvvrtiljpnbrzxkxaco.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndnZydGlsanBuYnJ6eGt4YWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTI3MjAsImV4cCI6MjA0NzgyODcyMH0.bKH3xesGXWulHGHpJWXCL3yo3gZxe75yJcR2w4uQ5SE'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Using fallback to localStorage only.')
}

// Create the Supabase client
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      // Increase timeout for all fetch requests
      fetch: (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
        
        // DO NOT override Auth headers - let Supabase client handle it
        return fetch(url, {
          ...options,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
      }
    },
    db: {
      schema: 'public'
    }
  }
)

// Global session management
let currentSession = null;

// Helper function to ensure user is authenticated before database operations
export const ensureAuthenticated = async () => {
  try {
    // Get current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    if (!data.session) {
      console.error('No active session found');
      throw new Error('You must be logged in to perform this action');
    }
    
    // Store current session for reuse
    currentSession = data.session;
    
    // Verify token is not expired
    if (data.session.expires_at) {
      const tokenExpiry = new Date(data.session.expires_at * 1000);
      const now = new Date();
      
      if (tokenExpiry <= now) {
        console.warn('Token expired, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Session refresh failed:', refreshError);
          throw new Error('Your session has expired. Please log in again.');
        }
        
        currentSession = refreshData.session;
      }
    }
    
    return currentSession;
  } catch (error) {
    console.error('Error in ensureAuthenticated:', error);
    throw error;
  }
};

// Get authenticated Supabase client with active session token
export const getAuthClient = async () => {
  const session = await ensureAuthenticated();
  
  if (!session || !session.access_token) {
    console.error('No valid session for authenticated client');
    throw new Error('Authentication required');
  }
  
  // Create a new client with the user's access token
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  });
  
  return authClient;
};

// Initialize API usage for new users
export const initializeApiUsage = async (userId: string) => {
  // Skip API usage tracking on the home page for better performance
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
  if (isHomePage) {
    // Don't attempt to track API usage on home page to avoid unnecessary DB calls
    return { user_id: userId, api_name: 'openai', call_count: 0 };
  }
  
  try {
    // First check if the user is authenticated
    await ensureAuthenticated();
    
    // Get existing record to avoid unnecessary upserts
    const { data: existing, error: getError } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('api_name', 'openai')
      .single();
      
    if (!getError && existing) {
      return existing;
    }
    
    // Try to insert only (no upsert) to avoid the constraint error
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .insert({ 
          user_id: userId,
          api_name: 'openai', 
          call_count: 0, 
          last_reset: new Date().toISOString()
        })
        .select();

      if (!error) {
        return data[0];
      }
      
      // If insert fails (likely due to duplicate), try to get the record again
      const { data: retryData } = await supabase
        .from('api_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('api_name', 'openai')
        .single();
        
      return retryData;
      
    } catch (insertError) {
      // Silent fail for home page performance
      console.log('Could not insert API usage record, continuing without tracking');
      return { user_id: userId, api_name: 'openai', call_count: 0 };
    }
  } catch (error) {
    // Return a mock object to prevent UI errors
    return { user_id: userId, api_name: 'openai', call_count: 0 };
  }
};

// Get user data
export const getUserData = async (userId: string) => {
  try {
    await ensureAuthenticated();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Save user data
export const saveUserData = async (userId: string, userData: any) => {
  try {
    await ensureAuthenticated();
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...userData,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user data:', error);
    return null;
  }
};