-- Function to check and increment API usage
CREATE OR REPLACE FUNCTION check_api_usage(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_record RECORD;
  current_time TIMESTAMP := NOW();
BEGIN
  -- Get the current usage record
  SELECT * INTO usage_record FROM api_usage WHERE api_usage.user_id = $1 LIMIT 1;
  
  -- Check if we need to reset the counter (daily reset)
  IF usage_record.last_reset < current_time THEN
    -- Reset the counter and update the reset time
    UPDATE api_usage 
    SET calls_count = 1, last_reset = current_time + INTERVAL '1 day'
    WHERE api_usage.user_id = $1;
    RETURN TRUE;
  END IF;
  
  -- Check if the user has exceeded their daily limit
  IF usage_record.calls_count >= 200 THEN
    RETURN FALSE;
  END IF;
  
  -- Increment the counter
  UPDATE api_usage 
  SET calls_count = calls_count + 1
  WHERE api_usage.user_id = $1;
  
  RETURN TRUE;
END;
$$;
