-- Fix the job_applications table schema and triggers

-- First, clean up and recreate the table structure if needed
DO $$ 
BEGIN
    -- Check if the updated_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'job_applications' 
                    AND column_name = 'updated_at') THEN
        -- Add the updated_at column if it doesn't exist
        ALTER TABLE public.job_applications 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Check if the created_at column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'job_applications' 
                    AND column_name = 'created_at') THEN
        -- Add the created_at column if it doesn't exist
        ALTER TABLE public.job_applications 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Check if the favorite column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'job_applications' 
                    AND column_name = 'favorite') THEN
        -- Add the favorite column if it doesn't exist
        ALTER TABLE public.job_applications 
        ADD COLUMN favorite BOOLEAN DEFAULT false;
    END IF;
    
    -- Check for last_updated column and add if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'job_applications' 
                    AND column_name = 'last_updated') THEN
        -- Add the last_updated column if it doesn't exist
        ALTER TABLE public.job_applications 
        ADD COLUMN last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Check for salary_min, salary_max columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'job_applications' 
                    AND column_name = 'salary_min') THEN
        -- Add the salary_min column if it doesn't exist
        ALTER TABLE public.job_applications 
        ADD COLUMN salary_min TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'job_applications' 
                    AND column_name = 'salary_max') THEN
        -- Add the salary_max column if it doesn't exist
        ALTER TABLE public.job_applications 
        ADD COLUMN salary_max TEXT;
    END IF;
END $$;

-- Create or replace the function to update the timestamp columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Update both timestamp columns for maximum compatibility
    NEW.updated_at = now();
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON public.job_applications;

-- Create the trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Update all existing rows to ensure timestamp fields are populated
UPDATE public.job_applications 
SET 
    updated_at = COALESCE(updated_at, created_at, now()),
    created_at = COALESCE(created_at, now()),
    last_updated = COALESCE(last_updated, updated_at, created_at, now());

-- Refresh the schema cache to make sure Supabase's API sees all changes
SELECT pg_notify('pgrst', 'reload schema');

-- Give it one more refresh to be safe
SELECT pg_notify('pgrst', 'reload schema');
