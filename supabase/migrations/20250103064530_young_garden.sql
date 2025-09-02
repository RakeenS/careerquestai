-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can update their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can insert their own API usage" ON public.api_usage;

-- Create more permissive RLS policies for api_usage
CREATE POLICY "Enable read access for authenticated users"
ON public.api_usage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users"
ON public.api_usage FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
ON public.api_usage FOR UPDATE
TO authenticated
USING (true);

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);