-- ⚠️ IMPORTANT: Replace 'REPLACE_WITH_YOUR_UID' with your actual User UID from Supabase Authentication

-- 1. Insert or Update the Admin Profile
INSERT INTO public.profiles (id, email, full_name, is_admin)
VALUES (
  'REPLACE_WITH_YOUR_UID', 
  'kipme001@gmail.com', 
  'Super Admin', 
  true
)
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, email = 'kipme001@gmail.com';

-- 2. Verify the fix
SELECT * FROM public.profiles WHERE email = 'kipme001@gmail.com';
