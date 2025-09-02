-- Run this in the Supabase SQL Editor to make sure the resumes table exists correctly

-- First check if the resumes table exists
DO $$
DECLARE 
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'resumes'
  ) INTO table_exists;
  
  -- Only create table if it doesn't exist
  IF NOT table_exists THEN
    CREATE TABLE public.resumes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content JSONB NOT NULL,
      template TEXT NOT NULL DEFAULT 'modern',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Add appropriate indexes
    CREATE INDEX resumes_user_id_idx ON public.resumes(user_id);
    
    -- Add RLS policies
    ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their own resumes"
      ON public.resumes
      FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own resumes"
      ON public.resumes
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own resumes"
      ON public.resumes
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own resumes"
      ON public.resumes
      FOR DELETE
      USING (auth.uid() = user_id);
      
    RAISE NOTICE 'Created resumes table with all required columns and policies';
  ELSE
    -- Update existing table with any missing columns
    
    -- Check if updated_at column exists and add if missing
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'resumes'
      AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.resumes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
      RAISE NOTICE 'Added missing updated_at column';
    END IF;
    
    -- Check if template column exists and add if missing
    IF NOT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'resumes'
      AND column_name = 'template'
    ) THEN
      ALTER TABLE public.resumes ADD COLUMN template TEXT NOT NULL DEFAULT 'modern';
      RAISE NOTICE 'Added missing template column';
    END IF;
    
    RAISE NOTICE 'Resumes table already exists, ensured all required columns are present';
  END IF;
END
$$;

-- Make sure RLS is enabled and policies exist
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE IF EXISTS public.resumes ENABLE ROW LEVEL SECURITY;
  
  -- Add policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can view their own resumes'
  ) THEN
    CREATE POLICY "Users can view their own resumes"
      ON public.resumes
      FOR SELECT
      USING (auth.uid() = user_id);
    RAISE NOTICE 'Added SELECT policy';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can insert their own resumes'
  ) THEN
    CREATE POLICY "Users can insert their own resumes"
      ON public.resumes
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Added INSERT policy';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can update their own resumes'
  ) THEN
    CREATE POLICY "Users can update their own resumes"
      ON public.resumes
      FOR UPDATE
      USING (auth.uid() = user_id);
    RAISE NOTICE 'Added UPDATE policy';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can delete their own resumes'
  ) THEN
    CREATE POLICY "Users can delete their own resumes"
      ON public.resumes
      FOR DELETE
      USING (auth.uid() = user_id);
    RAISE NOTICE 'Added DELETE policy';
  END IF;
END
$$;

-- Add a test query to verify the table exists and has the right structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'resumes'
) AS resumes_table_exists;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'resumes'
ORDER BY ordinal_position;
