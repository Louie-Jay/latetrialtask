-- Ensure admin account exists and has proper permissions
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- First check if admin exists
  SELECT id INTO admin_uid
  FROM auth.users
  WHERE email = 'themvisionstudio@gmail.com'
  LIMIT 1;

  IF admin_uid IS NULL THEN
    -- Create new admin user
    admin_uid := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    )
    VALUES (
      admin_uid,
      'themvisionstudio@gmail.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      'authenticated',
      'authenticated'
    );

    -- Create admin profile
    INSERT INTO public.users (
      id,
      email,
      role,
      is_platform_admin,
      full_name
    )
    VALUES (
      admin_uid,
      'themvisionstudio@gmail.com',
      'admin',
      true,
      'Platform Admin'
    );
  ELSE
    -- Update existing admin
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      updated_at = now()
    WHERE id = admin_uid;

    -- Ensure admin profile exists
    INSERT INTO public.users (
      id,
      email,
      role,
      is_platform_admin,
      full_name
    )
    VALUES (
      admin_uid,
      'themvisionstudio@gmail.com',
      'admin',
      true,
      'Platform Admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'admin',
      is_platform_admin = true,
      full_name = 'Platform Admin';
  END IF;

  -- Verify admin exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'themvisionstudio@gmail.com'
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Failed to verify admin account';
  END IF;
END $$;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup 
ON public.users(email, role, is_platform_admin);

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table with admin user (themvisionstudio@gmail.com).
Admin user has full platform access and permissions.';