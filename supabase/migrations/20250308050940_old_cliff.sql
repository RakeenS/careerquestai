/*
  # Create users and API usage tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `api_usage`
      - `user_id` (uuid, primary key)
      - `calls_count` (integer)
      - `last_reset` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create API usage table
CREATE TABLE IF NOT EXISTS api_usage (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  calls_count integer DEFAULT 0,
  last_reset timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own API usage"
  ON api_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API usage"
  ON api_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to check and increment API usage
CREATE OR REPLACE FUNCTION check_api_usage(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  last_reset_time timestamptz;
  daily_limit integer := 200;
BEGIN
  -- Get current usage
  SELECT calls_count, last_reset INTO current_count, last_reset_time
  FROM api_usage
  WHERE api_usage.user_id = $1;

  -- Reset count if it's been 24 hours
  IF last_reset_time < NOW() - INTERVAL '24 hours' THEN
    UPDATE api_usage
    SET calls_count = 0, last_reset = NOW()
    WHERE api_usage.user_id = $1;
    RETURN true;
  END IF;

  -- Check if under limit
  IF current_count >= daily_limit THEN
    RETURN false;
  END IF;

  -- Increment count
  UPDATE api_usage
  SET calls_count = calls_count + 1
  WHERE api_usage.user_id = $1;

  RETURN true;
END;
$$;