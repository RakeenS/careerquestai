import { supabase } from './supabaseClient';

/**
 * Ensures that the job_applications table exists in Supabase
 * and has the correct structure and policies.
 */
export const ensureJobApplicationsTable = async (): Promise<{ success: boolean; message: string }> => {
  console.log('Setting up job_applications table in Supabase...');
  
  try {
    // First, check if the table already exists
    const { error } = await supabase
      .from('job_applications')
      .select('id')
      .limit(1);
      
    if (!error) {
      console.log('job_applications table already exists');
      
      // Table exists, log success
      console.log('Table exists and is accessible through the API');
      
      // Note: We're skipping the schema cache refresh as pg_notify isn't available
      // through the REST API in standard Supabase projects
      
      return { success: true, message: 'Table already exists' };
    }
    
    // Table doesn't exist or there was an error, try to create it
    console.log('Creating job_applications table...');
    
    // Run the SQL script to create the table and set up RLS
    const createTableResult = await supabase.rpc('run_sql_script', {
      sql_script: `
        -- Create the job_applications table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.job_applications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            date DATE NOT NULL,
            status TEXT NOT NULL,
            salary_min TEXT,
            salary_max TEXT,
            notes TEXT,
            skills TEXT[],
            favorite BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Set up Row Level Security (RLS) for the job_applications table
        ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist to avoid errors
        DROP POLICY IF EXISTS "Users can view their own job applications" ON public.job_applications;
        DROP POLICY IF EXISTS "Users can insert their own job applications" ON public.job_applications;
        DROP POLICY IF EXISTS "Users can update their own job applications" ON public.job_applications;
        DROP POLICY IF EXISTS "Users can delete their own job applications" ON public.job_applications;
        
        -- Create policy to allow users to select only their own job applications
        CREATE POLICY "Users can view their own job applications"
            ON public.job_applications
            FOR SELECT
            USING (auth.uid() = user_id);
        
        -- Create policy to allow users to insert their own job applications
        CREATE POLICY "Users can insert their own job applications"
            ON public.job_applications
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        
        -- Create policy to allow users to update their own job applications
        CREATE POLICY "Users can update their own job applications"
            ON public.job_applications
            FOR UPDATE
            USING (auth.uid() = user_id);
        
        -- Create policy to allow users to delete their own job applications
        CREATE POLICY "Users can delete their own job applications"
            ON public.job_applications
            FOR DELETE
            USING (auth.uid() = user_id);
        
        -- Create an updated_at trigger function if it doesn't already exist
        CREATE OR REPLACE FUNCTION public.set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Apply the updated_at trigger to the job_applications table
        DROP TRIGGER IF EXISTS set_job_applications_updated_at ON public.job_applications;
        CREATE TRIGGER set_job_applications_updated_at
        BEFORE UPDATE ON public.job_applications
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
        
        -- Refresh the schema cache
        SELECT pg_notify('pgrst', 'reload schema');
      `
    });
    
    if (createTableResult.error) {
      console.error('Error creating job_applications table:', createTableResult.error);
      
      // If the error is about the RPC function not existing, provide alternative instructions
      if (createTableResult.error.message.includes('function') && createTableResult.error.message.includes('does not exist')) {
        return { 
          success: false, 
          message: 'The run_sql_script RPC function does not exist. Please run the job_applications_setup.sql script directly in the Supabase SQL editor.' 
        };
      }
      
      return { success: false, message: `Error: ${createTableResult.error.message}` };
    }
    
    console.log('Successfully created job_applications table');
    
    // Refresh the schema cache
    try {
      const refreshResult = await supabase.rpc('refresh_schema_cache');
      if (refreshResult.error) {
        console.warn('Failed to refresh schema cache:', refreshResult.error);
      }
    } catch (refreshError) {
      console.warn('Exception refreshing schema cache:', refreshError);
    }
    
    return { success: true, message: 'Successfully created job_applications table' };
  } catch (error) {
    console.error('Exception setting up job_applications table:', error);
    return { success: false, message: `Exception: ${error instanceof Error ? error.message : String(error)}` };
  }
};

/**
 * Ensures all required tables exist in Supabase.
 * Call this function on app initialization.
 */
export const setupSupabaseTables = async (): Promise<void> => {
  console.log('Setting up Supabase tables...');
  
  // Set up job_applications table
  const jobsTableResult = await ensureJobApplicationsTable();
  console.log('Job applications table setup result:', jobsTableResult);
  
  // Add more table setup functions as needed
};
