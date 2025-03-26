-- Drop and recreate admin user with proper error handling
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- First remove any existing admin entries to start fresh
  DELETE FROM auth.users WHERE email = 'themvisionstudio@gmail.com';
  DELETE FROM public.users WHERE email = 'themvisionstudio@gmail.com';

  -- Create new admin user with known UUID
  admin_uid := gen_random_uuid();
  
  -- Insert into auth.users with minimal required fields
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

  -- Insert into public.users with required fields
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

  -- Verify the admin was created
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'themvisionstudio@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Failed to create admin user';
  END IF;

  RAISE NOTICE 'Admin account created successfully with ID: %', admin_uid;
END $$;

-- Ensure proper admin policy exists
DROP POLICY IF EXISTS "Admin access" ON users;
CREATE POLICY "Admin access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.email() = 'themvisionstudio@gmail.com'
  )
  WITH CHECK (
    auth.email() = 'themvisionstudio@gmail.com'
  );