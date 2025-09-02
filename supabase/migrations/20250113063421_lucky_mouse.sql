-- Create waitlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert into waitlist
CREATE POLICY "Enable insert for all users" ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow authenticated users to view waitlist
CREATE POLICY "Enable read access for authenticated users only" ON public.waitlist
    FOR SELECT
    TO authenticated
    USING (true);