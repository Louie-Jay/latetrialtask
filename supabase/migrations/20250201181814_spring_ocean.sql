-- Drop and recreate admin user to ensure clean state
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- First remove any existing admin entries to start fresh
  DELETE FROM auth.users WHERE email = 'themvisionstudio@gmail.com';
  DELETE FROM public.users WHERE email = 'themvisionstudio@gmail.com';

  -- Create new admin user with known UUID
  admin_uid := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_uid,
    'authenticated',
    'authenticated',
    'themvisionstudio@gmail.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    '{}'::jsonb,
    now(),
    now()
  );

  -- Insert into public.users
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

  RAISE NOTICE 'Admin account created with ID: %', admin_uid;
END $$;

-- Verify admin policies
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