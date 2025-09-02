/*
  # User Content Tables

  1. New Tables
    - cover_letters
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - content (text)
      - created_at (timestamptz)
    - email_templates
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - content (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create cover letters table
CREATE TABLE IF NOT EXISTS public.cover_letters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for cover letters
CREATE POLICY "Users can view their own cover letters"
    ON public.cover_letters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cover letters"
    ON public.cover_letters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters"
    ON public.cover_letters FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for email templates
CREATE POLICY "Users can view their own email templates"
    ON public.email_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email templates"
    ON public.email_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates"
    ON public.email_templates FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON public.cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON public.email_templates(user_id);