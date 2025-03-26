-- Verify and update admin account
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
      full_name,
      points
    )
    VALUES (
      admin_uid,
      'themvisionstudio@gmail.com',
      'admin',
      true,
      'Platform Admin',
      0
    );
  END IF;
END $$;

-- Verify indexes exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(email, role, is_platform_admin);

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table with admin user (themvisionstudio@gmail.com).
Admin user has full platform access and permissions.';