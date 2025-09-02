-- Run this in the Supabase SQL Editor to clean up duplicate policies

-- First, drop all existing policies for the resumes table
DO $$
BEGIN
  -- Drop all policies for the resumes table
  DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
  DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
  
  DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
  DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
  
  DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
  DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
  
  DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
  DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
  
  RAISE NOTICE 'Dropped all existing policies for resumes table';
END
$$;

-- Now create simple policies with consistent naming
DO $$
BEGIN
  -- Create new clean policies
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
    
  RAISE NOTICE 'Created new clean policies for resumes table';
END
$$;
