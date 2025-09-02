-- Function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete from all tables
  DELETE FROM public.resumes WHERE user_id = $1;
  DELETE FROM public.job_applications WHERE user_id = $1;
  DELETE FROM public.user_stats WHERE user_id = $1;
  DELETE FROM public.user_activities WHERE user_id = $1;
  
  -- Delete storage objects
  DELETE FROM storage.objects 
  WHERE bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;