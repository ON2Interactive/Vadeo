-- 1. Create a secure RPC function for Admin Deletion
-- This runs with SECURITY DEFINER to bypass RLS restrictions
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void AS $$
DECLARE
  calling_user_is_admin BOOLEAN;
BEGIN
  -- Security Check: ONLY allow if the person calling this is an admin in the profiles table
  SELECT is_admin INTO calling_user_is_admin FROM public.profiles WHERE id = auth.uid();
  
  IF calling_user_is_admin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access Denied: You must be an admin to delete users.';
  END IF;

  -- A. Delete User's Projects
  DELETE FROM public.projects WHERE user_id = target_user_id;
  
  -- B. Delete User's Profile
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- NOTE: This removes the user from your dashboard and cleanup their data.
  -- The Auth user remains in Supabase Auth but without a profile or data.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify
SELECT 'RPC admin_delete_user Updated' as status;
