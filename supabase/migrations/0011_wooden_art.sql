/*
  # Add API Usage Procedure

  1. New Functions
    - `increment_api_usage`: Increments the API usage counter and handles daily resets
*/

-- Create function to increment API usage
CREATE OR REPLACE FUNCTION increment_api_usage(user_id UUID)
RETURNS void AS $$
DECLARE
    current_usage RECORD;
BEGIN
    -- Get or create usage record
    INSERT INTO api_usage (user_id, calls_count, last_reset)
    VALUES (user_id, 0, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT * INTO current_usage FROM api_usage WHERE user_id = $1;

    -- Reset counter if last reset was more than 24 hours ago
    IF CURRENT_TIMESTAMP - current_usage.last_reset >= INTERVAL '24 hours' THEN
        UPDATE api_usage
        SET calls_count = 1, last_reset = CURRENT_TIMESTAMP
        WHERE user_id = $1;
    ELSE
        -- Increment usage
        UPDATE api_usage
        SET calls_count = calls_count + 1
        WHERE user_id = $1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;