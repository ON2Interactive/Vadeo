-- 1. Insert the Admin Profile manually
-- ID provided by user: 0e4cb6e3-f3af-47d7-9d1e-7e012a2af8a0

INSERT INTO public.profiles (id, email, full_name, is_admin)
VALUES (
  '0e4cb6e3-f3af-47d7-9d1e-7e012a2af8a0', 
  'kipme001@gmail.com', 
  'Super Admin', 
  true
)
ON CONFLICT (id) DO UPDATE 
SET is_admin = true;

-- 2. Verify
SELECT * FROM public.profiles WHERE email = 'kipme001@gmail.com';
