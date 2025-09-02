// Supabase connection test script
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

// Get directory path for current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Get Supabase credentials from environment variables or use the ones from the project
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ygvvrtiljpnbrzxkxaco.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndnZydGlsanBuYnJ6eGt4YWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNTI3MjAsImV4cCI6MjA0NzgyODcyMH0.bKH3xesGXWulHGHpJWXCL3yo3gZxe75yJcR2w4uQ5SE';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseAnonKey.substring(0, 10)}...`);
  
  try {
    // Try to access the resumes table
    console.log('\nTesting access to resumes table...');
    const { data: resumesData, error: resumesError } = await supabase
      .from('resumes')
      .select('*')
      .limit(1);
      
    if (resumesError) {
      console.error('❌ Cannot access resumes table:', resumesError);
    } else {
      console.log('✅ Successfully accessed resumes table');
      console.log('Data:', resumesData);
    }
    
    // Test other tables
    const tables = ['job_applications', 'user_stats', 'user_goals', 'interviews', 'activities'];
    
    for (const table of tables) {
      console.log(`\nTesting access to ${table} table...`);
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error(`❌ Cannot access ${table} table:`, tableError);
      } else {
        console.log(`✅ Successfully accessed ${table} table`);
        console.log('Data:', tableData);
      }
    }
    
    // Test authentication status
    console.log('\nChecking authentication status...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Authentication check failed:', authError);
    } else {
      console.log('✅ Authentication check completed');
      console.log('Session exists:', authData.session !== null);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed with exception:', error);
  }
}

// Run the test
testConnection()
  .then(() => console.log('\nConnection test completed'))
  .catch(err => console.error('Test failed with error:', err));
