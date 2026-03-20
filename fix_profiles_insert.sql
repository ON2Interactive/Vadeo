-- Allow users to insert their own profile record during signup
-- This is required because initUserProfile runs on the client side

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure select policy exists and is correct (using our secure is_admin() function)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- Ensure update policy exists and is correct
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- Verify
SELECT 'Profile Policies Updated' as status;
