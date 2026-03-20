-- Fix 'Infinite Recursion' bug in RLS policies

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER means this runs with owner permissions (bypassing RLS recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update View Policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR 
  public.check_is_admin() = true
);

-- 3. Update Edit Policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR 
  public.check_is_admin() = true
);
