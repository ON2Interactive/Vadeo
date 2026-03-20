-- Manually confirm the user email
UPDATE auth.users 
SET email_confirmed_at = now(),
    last_sign_in_at = now()
WHERE email = 'kipme001@gmail.com';

-- Ensure the profile exists (in case the trigger didn't fire or rolled back)
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Kip Test')
FROM auth.users
WHERE email = 'kipme001@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Verify the result
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'kipme001@gmail.com';
SELECT * FROM public.profiles WHERE email = 'kipme001@gmail.com';
