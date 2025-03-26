-- Verify admin account exists and is properly configured
DO $$
DECLARE
  admin_count integer;
BEGIN
  -- Check auth.users table
  SELECT COUNT(*) INTO admin_count
  FROM auth.users
  WHERE email = 'themvisionstudio@gmail.com';

  -- Log status for debugging
  RAISE NOTICE 'Found % admin users', admin_count;

  -- Verify public.users table
  SELECT COUNT(*) INTO admin_count
  FROM public.users
  WHERE email = 'themvisionstudio@gmail.com'
  AND role = 'admin'
  AND is_platform_admin = true;

  RAISE NOTICE 'Found % admin profiles', admin_count;
END $$;

-- Add index for admin lookups if not exists
CREATE INDEX IF NOT EXISTS idx_users_admin_lookup 
ON public.users(email, role, is_platform_admin)
WHERE role = 'admin' AND is_platform_admin = true;