-- Setup admin account with proper error handling
DO $$
DECLARE
  admin_uid uuid;
  existing_user_id uuid;
BEGIN
  -- First check if admin user already exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = 'themvisionstudio@gmail.com'
  LIMIT 1;

  IF existing_user_id IS NULL THEN
    -- Create new admin user if doesn't exist
    admin_uid := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
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
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- Use existing admin user id
    admin_uid := existing_user_id;
    
    -- Update existing admin user
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      updated_at = now(),
      encrypted_password = crypt('Admin123!', gen_salt('bf'))
    WHERE id = admin_uid;
  END IF;

  -- Ensure admin exists in public.users
  INSERT INTO public.users (
    id,
    email,
    role,
    points,
    is_platform_admin,
    full_name,
    created_at
  )
  VALUES (
    admin_uid,
    'themvisionstudio@gmail.com',
    'admin',
    0,
    true,
    'Platform Admin',
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'admin',
    is_platform_admin = true,
    full_name = 'Platform Admin',
    email = 'themvisionstudio@gmail.com';

END $$;

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table with admin user (themvisionstudio@gmail.com).
Admin user has full platform access and permissions.';