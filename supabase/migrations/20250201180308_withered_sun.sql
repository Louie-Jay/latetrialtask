-- Update admin full name
UPDATE public.users
SET full_name = 'Platform Admin'
WHERE email = 'themvisionstudio@gmail.com';

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table with admin user (themvisionstudio@gmail.com).
Admin user has full_name set to "Platform Admin" for proper display.';