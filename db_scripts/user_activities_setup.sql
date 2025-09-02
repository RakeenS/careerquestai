-- user_activities table setup script
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Additional fields for better querying
  related_entity_id UUID,
  related_entity_type VARCHAR(50)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Add Row Level Security (RLS) policies
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own activities
CREATE POLICY select_own_activities ON user_activities 
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid());

-- Policy to allow users to insert only their own activities
CREATE POLICY insert_own_activities ON user_activities 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

-- Realtime subscription setup
ALTER PUBLICATION supabase_realtime ADD TABLE user_activities;

-- Function to update created_at when an activity is created
CREATE OR REPLACE FUNCTION set_activity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure created_at is always set to current time
CREATE TRIGGER set_activity_created_at
BEFORE INSERT ON user_activities
FOR EACH ROW
EXECUTE FUNCTION set_activity_timestamp();
