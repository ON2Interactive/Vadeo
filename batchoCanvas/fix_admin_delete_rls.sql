-- 1. Update Projects DELETE Policy to allow Admins
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE
USING (
  auth.uid() = user_id 
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 2. Add Profiles DELETE Policy (Allow Admins to delete users)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE
USING (
  auth.uid() = id 
  OR 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
