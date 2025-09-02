-- SQL script to create missing tables in Supabase
-- Run this in the Supabase SQL Editor

-- Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    target_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS (Row Level Security) policies for user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own goals
CREATE POLICY "Users can view their own goals"
    ON public.user_goals
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can insert their own goals"
    ON public.user_goals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update their own goals"
    ON public.user_goals
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete their own goals"
    ON public.user_goals
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    interview_type TEXT,  -- e.g., phone, video, in-person
    status TEXT DEFAULT 'scheduled',  -- e.g., scheduled, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS (Row Level Security) policies for interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own interviews
CREATE POLICY "Users can view their own interviews"
    ON public.interviews
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own interviews
CREATE POLICY "Users can insert their own interviews"
    ON public.interviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own interviews
CREATE POLICY "Users can update their own interviews"
    ON public.interviews
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own interviews
CREATE POLICY "Users can delete their own interviews"
    ON public.interviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON public.user_goals TO authenticated;
GRANT ALL ON public.interviews TO authenticated;
