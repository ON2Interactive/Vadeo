-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own projects
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own projects
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own projects
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to view/edit all projects (Optional, but good for admin dashboard)
-- CREATE POLICY "Admins can view all projects" ON public.projects FOR SELECT
-- USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true);
