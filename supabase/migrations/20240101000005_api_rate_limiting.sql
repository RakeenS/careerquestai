-- Add API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    calls_count INTEGER DEFAULT 0,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API usage"
ON public.api_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own API usage"
ON public.api_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Function to check and update API usage
CREATE OR REPLACE FUNCTION check_api_usage(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage RECORD;
    daily_limit INTEGER := 200;
BEGIN
    -- Get or create usage record
    INSERT INTO public.api_usage (user_id, calls_count, last_reset)
    VALUES (user_id, 0, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO current_usage FROM public.api_usage WHERE user_id = $1;

    -- Reset counter if last reset was more than 24 hours ago
    IF CURRENT_TIMESTAMP - current_usage.last_reset >= INTERVAL '24 hours' THEN
        UPDATE public.api_usage
        SET calls_count = 1, last_reset = CURRENT_TIMESTAMP
        WHERE user_id = $1;
        RETURN TRUE;
    END IF;

    -- Check if under limit
    IF current_usage.calls_count >= daily_limit THEN
        RETURN FALSE;
    END IF;

    -- Increment usage
    UPDATE public.api_usage
    SET calls_count = calls_count + 1
    WHERE user_id = $1;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;