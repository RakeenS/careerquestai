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
