-- Complete Supabase Storage policy setup
-- Run this in the Supabase SQL Editor

-- First, clean up all existing policies to avoid duplicates
DO $$
BEGIN
  -- Drop all policies for the resumes bucket
  DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can select their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Resume_Select_Policy" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to insert their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their own resume files" ON storage.objects;
  DROP POLICY IF EXISTS "Resume_Insert_Policy" ON storage.objects;
  DROP POLICY IF EXISTS "Resume_Update_Policy" ON storage.objects;
  DROP POLICY IF EXISTS "Resume_Delete_Policy" ON storage.objects;
  
  -- Also drop bucket policies that might exist
  DROP POLICY IF EXISTS "Allow authenticated users to create buckets" ON storage.buckets;
  DROP POLICY IF EXISTS "Allow users to access their own buckets" ON storage.buckets;
  DROP POLICY IF EXISTS "Allow authenticated users to view buckets" ON storage.buckets;
  
  RAISE NOTICE 'Dropped all existing policies for storage.objects and storage.buckets';
END
$$;

-- Create the proper bucket policy (must enable bucket access first)
CREATE POLICY "Allow authenticated users to create buckets"
ON storage.buckets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- This policy is critical - it allows users to see buckets
CREATE POLICY "Allow authenticated users to view buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to access their own buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (owner = auth.uid());

-- Create storage.objects policies (essential for file operations)
-- 1. Allow users to select/read their own files
CREATE POLICY "Resume_Select_Policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow users to insert/upload their own files
CREATE POLICY "Resume_Insert_Policy"
ON storage.objects
FOR INSERT
TO authenticated 
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to update their own files
CREATE POLICY "Resume_Update_Policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own files
CREATE POLICY "Resume_Delete_Policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
