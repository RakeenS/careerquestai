-- Create the user_goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target INTEGER NOT NULL DEFAULT 1,
    current INTEGER NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security (RLS) for the user_goals table
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own goals
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
CREATE POLICY "Users can view their own goals"
    ON public.user_goals
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own goals
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.user_goals;
CREATE POLICY "Users can insert their own goals"
    ON public.user_goals
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own goals
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
CREATE POLICY "Users can update their own goals"
    ON public.user_goals
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own goals
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;
CREATE POLICY "Users can delete their own goals"
    ON public.user_goals
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create an updated_at trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the updated_at trigger to the user_goals table
DROP TRIGGER IF EXISTS set_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER set_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
