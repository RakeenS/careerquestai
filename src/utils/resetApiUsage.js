// This is a utility script to reset API usage or grant admin privileges to your account
// Run this script with: node resetApiUsage.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ygvvrtiljpnbrzxkxaco.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndnZydGlsanBuYnJ6eGt4YWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTI3MjAsImV4cCI6MjA0NzgyODcyMH0.bKH3xesGXWulHGHpJWXCL3yo3gZxe75yJcR2w4uQ5SE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetAllApiUsage() {
  try {
    console.log('Resetting API usage for all users...');
    
    // Reset API usage for all users
    const { data, error } = await supabase
      .from('api_usage')
      .update({ calls_count: 0, last_reset: new Date().toISOString() })
      .neq('user_id', '0');
      
    if (error) throw error;
    console.log('Successfully reset API usage for all users!');
    return data;
  } catch (error) {
    console.error('Error resetting API usage:', error);
  }
}

async function grantAdminStatus() {
  try {
    // First, get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    if (!user) {
      console.error('No user is currently logged in.');
      return;
    }
    
    console.log('Granting admin status to user:', user.id);
    
    // Update user metadata to include isAdmin flag
    const { data, error } = await supabase.auth.updateUser({
      data: { isAdmin: true }
    });
    
    if (error) throw error;
    console.log('Successfully granted admin status to user:', user.id);
    console.log('You now have unlimited API usage.');
    return data;
  } catch (error) {
    console.error('Error granting admin status:', error);
  }
}

// Run both functions
async function main() {
  await grantAdminStatus();
  await resetAllApiUsage();
  console.log('Operation complete. Please refresh your application.');
}

main();
