-- Create admin user with proper error handling and auth setup
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- First remove any existing admin entries to start fresh
  DELETE FROM auth.users WHERE email = 'themvisionstudio@gmail.com';
  DELETE FROM public.users WHERE email = 'themvisionstudio@gmail.com';

  -- Create new admin user with known UUID
  admin_uid := gen_random_uuid();
  
  -- Insert into auth.users with all required fields
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    admin_uid,
    '00000000-0000-0000-0000-000000000000',
    'themvisionstudio@gmail.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Insert into public.users with required fields
  INSERT INTO public.users (
    id,
    email,
    role,
    is_platform_admin,
    full_name,
    points,
    created_at
  )
  VALUES (
    admin_uid,
    'themvisionstudio@gmail.com',
    'admin',
    true,
    'Platform Admin',
    0,
    now()
  );

  -- Verify the admin was created
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'themvisionstudio@gmail.com'
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Failed to create admin user';
  END IF;

  -- Create auth schema indexes if they don't exist
  CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(instance_id);
  CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
  CREATE INDEX IF NOT EXISTS users_confirmed_idx ON auth.users(email_confirmed_at);

  RAISE NOTICE 'Admin account created successfully with ID: %', admin_uid;
END $$;

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table with admin user (themvisionstudio@gmail.com).
Admin user has full platform access and permissions.';