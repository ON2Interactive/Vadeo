-- 1. Add the is_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Allow admins to view ALL profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 3. Allow admins to update ALL profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 4. Flag your email as admin
UPDATE public.profiles
SET is_admin = true
WHERE email = 'kipme001@gmail.com';

-- 5. Verify the update
SELECT email, is_admin FROM public.profiles WHERE email = 'kipme001@gmail.com';
