-- Migration script to create essential tables for the Resume Builder application

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    content JSONB NOT NULL,
    job_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    salary_min TEXT,
    salary_max TEXT,
    notes TEXT,
    skills JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_application_id UUID,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    FOREIGN KEY (job_application_id) REFERENCES public.job_applications(id) ON DELETE SET NULL
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    target INTEGER DEFAULT 0,
    current INTEGER DEFAULT 0,
    due_date TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY,
    resumes_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    interviews_completed INTEGER DEFAULT 0,
    job_offers INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create api_usage table for tracking API limits
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    api_name TEXT NOT NULL,
    call_count INTEGER DEFAULT 0,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access only their own data
DO $$
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'resumes' 
        AND policyname = 'Users can view their own resumes'
    ) THEN
        CREATE POLICY "Users can view their own resumes" 
            ON public.resumes FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'resumes' 
        AND policyname = 'Users can insert their own resumes'
    ) THEN
        CREATE POLICY "Users can insert their own resumes" 
            ON public.resumes FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'resumes' 
        AND policyname = 'Users can update their own resumes'
    ) THEN
        CREATE POLICY "Users can update their own resumes" 
            ON public.resumes FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'resumes' 
        AND policyname = 'Users can delete their own resumes'
    ) THEN
        CREATE POLICY "Users can delete their own resumes" 
            ON public.resumes FOR DELETE 
            USING (auth.uid() = user_id);
    END IF;

    -- Apply similar policies to job_applications table
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'job_applications' 
        AND policyname = 'Users can view their own job applications'
    ) THEN
        CREATE POLICY "Users can view their own job applications" 
            ON public.job_applications FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'job_applications' 
        AND policyname = 'Users can insert their own job applications'
    ) THEN
        CREATE POLICY "Users can insert their own job applications" 
            ON public.job_applications FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'job_applications' 
        AND policyname = 'Users can update their own job applications'
    ) THEN
        CREATE POLICY "Users can update their own job applications" 
            ON public.job_applications FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'job_applications' 
        AND policyname = 'Users can delete their own job applications'
    ) THEN
        CREATE POLICY "Users can delete their own job applications" 
            ON public.job_applications FOR DELETE 
            USING (auth.uid() = user_id);
    END IF;
    
    -- Add similar conditional logic for other tables as needed
END $$;

-- Add policies for the remaining tables
DO $$
BEGIN
    -- Interviews table policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'interviews' 
        AND policyname = 'Users can view their own interviews'
    ) THEN
        CREATE POLICY "Users can view their own interviews" 
            ON public.interviews FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'interviews' 
        AND policyname = 'Users can insert their own interviews'
    ) THEN
        CREATE POLICY "Users can insert their own interviews" 
            ON public.interviews FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'interviews' 
        AND policyname = 'Users can update their own interviews'
    ) THEN
        CREATE POLICY "Users can update their own interviews" 
            ON public.interviews FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'interviews' 
        AND policyname = 'Users can delete their own interviews'
    ) THEN
        CREATE POLICY "Users can delete their own interviews" 
            ON public.interviews FOR DELETE 
            USING (auth.uid() = user_id);
    END IF;

    -- User goals table policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_goals' 
        AND policyname = 'Users can view their own goals'
    ) THEN
        CREATE POLICY "Users can view their own goals" 
            ON public.user_goals FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_goals' 
        AND policyname = 'Users can insert their own goals'
    ) THEN
        CREATE POLICY "Users can insert their own goals" 
            ON public.user_goals FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_goals' 
        AND policyname = 'Users can update their own goals'
    ) THEN
        CREATE POLICY "Users can update their own goals" 
            ON public.user_goals FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_goals' 
        AND policyname = 'Users can delete their own goals'
    ) THEN
        CREATE POLICY "Users can delete their own goals" 
            ON public.user_goals FOR DELETE 
            USING (auth.uid() = user_id);
    END IF;

    -- User activities table policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_activities' 
        AND policyname = 'Users can view their own activities'
    ) THEN
        CREATE POLICY "Users can view their own activities" 
            ON public.user_activities FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_activities' 
        AND policyname = 'Users can insert their own activities'
    ) THEN
        CREATE POLICY "Users can insert their own activities" 
            ON public.user_activities FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- User stats table policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_stats' 
        AND policyname = 'Users can view their own stats'
    ) THEN
        CREATE POLICY "Users can view their own stats" 
            ON public.user_stats FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_stats' 
        AND policyname = 'Users can insert their own stats'
    ) THEN
        CREATE POLICY "Users can insert their own stats" 
            ON public.user_stats FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_stats' 
        AND policyname = 'Users can update their own stats'
    ) THEN
        CREATE POLICY "Users can update their own stats" 
            ON public.user_stats FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;

    -- API usage table policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_usage' 
        AND policyname = 'Users can view their own api usage'
    ) THEN
        CREATE POLICY "Users can view their own api usage" 
            ON public.api_usage FOR SELECT 
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_usage' 
        AND policyname = 'Users can insert their own api usage'
    ) THEN
        CREATE POLICY "Users can insert their own api usage" 
            ON public.api_usage FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'api_usage' 
        AND policyname = 'Users can update their own api usage'
    ) THEN
        CREATE POLICY "Users can update their own api usage" 
            ON public.api_usage FOR UPDATE 
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indices for performance
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS interviews_user_id_idx ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS user_goals_user_id_idx ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS api_usage_user_id_idx ON public.api_usage(user_id);
