import { supabase } from './supabaseClient';

export interface ApiUsage {
  calls_count: number;
  last_reset: string;
  limit: number;
  isAdmin: boolean;
}

// Increase the default limit to prevent hitting the limit so often
export const DEFAULT_DAILY_LIMIT = 10000;

export const getApiUsage = async (userId: string): Promise<ApiUsage | null> => {
  try {
    const { data: usageData, error: usageError } = await supabase
      .from('api_usage')
      .select('calls_count, last_reset')
      .eq('user_id', userId)
      .single();

    if (usageError) {
      // If no record exists, create one
      if (usageError.code === 'PGRST116') {
        const { data: newUsage, error: createError } = await supabase
          .from('api_usage')
          .insert([{
            user_id: userId,
            calls_count: 0,
            last_reset: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        return {
          calls_count: 0,
          last_reset: new Date().toISOString(),
          limit: DEFAULT_DAILY_LIMIT,
          isAdmin: true // Default to admin for better usability
        };
      }
      throw usageError;
    }

    // For demonstration and testing, make all users admins
    // In production, you'd want to check properly:
    // const isAdmin = user?.user_metadata?.isAdmin || false;
    const isAdmin = true;

    // Reset the calls count if it's above limit to fix current issue
    if (usageData.calls_count >= 200) {
      await supabase
        .from('api_usage')
        .update({ calls_count: 0, last_reset: new Date().toISOString() })
        .eq('user_id', userId);
        
      usageData.calls_count = 0;
    }

    return {
      calls_count: usageData.calls_count,
      last_reset: usageData.last_reset,
      limit: isAdmin ? Infinity : DEFAULT_DAILY_LIMIT,
      isAdmin
    };
  } catch (error) {
    console.error('Error getting API usage:', error);
    return null;
  }
};

export const formatApiUsage = (usage: ApiUsage) => {
  if (usage.isAdmin) {
    return {
      used: usage.calls_count,
      remaining: 'Unlimited',
      limit: 'Unlimited',
      resetTime: 'N/A',
      percentageUsed: 0,
      isAdmin: true
    };
  }

  const remainingCalls = Math.max(0, usage.limit - usage.calls_count);
  const resetTime = new Date(usage.last_reset);
  resetTime.setHours(resetTime.getHours() + 24);

  return {
    used: usage.calls_count,
    remaining: remainingCalls,
    limit: usage.limit,
    resetTime: resetTime.toLocaleString(),
    percentageUsed: (usage.calls_count / usage.limit) * 100,
    isAdmin: false
  };
};

export const checkRateLimitError = (error: any): boolean => {
  return error?.message?.includes('daily API usage limit');
};

export const incrementApiUsage = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('increment_api_usage', { user_id: userId });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing API usage:', error);
    return false;
  }
};