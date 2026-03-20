-- Force Refresh of Admin Policies

-- 1. Ensure the helper function exists and is secure
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PROJECTS: Allow Admins to DELETE
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects; -- Cleanup old names

CREATE POLICY "Enable delete for users and admins" ON public.projects FOR DELETE
USING (auth.uid() = user_id OR public.is_admin());

-- 3. PROFILES: Allow Admins to DELETE
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles; -- Cleanup old names

CREATE POLICY "Enable delete for users and admins" ON public.profiles FOR DELETE
USING (auth.uid() = id OR public.is_admin());

-- Confirmation
SELECT 'Policies Updated Successfully' as status;
