-- Enable RLS on api_usage table
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can update their own API usage" ON public.api_usage;
DROP POLICY IF EXISTS "Users can insert their own API usage" ON public.api_usage;

-- Create RLS policies for api_usage
CREATE POLICY "Users can view their own API usage"
ON public.api_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own API usage"
ON public.api_usage FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API usage"
ON public.api_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);