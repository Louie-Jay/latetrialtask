-- Setup admin account properly
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  -- First try to get existing admin user id
  SELECT id INTO admin_uid
  FROM auth.users
  WHERE email = 'themvisionstudio@gmail.com';

  -- If admin doesn't exist, create new admin user
  IF admin_uid IS NULL THEN
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
    -- Update existing admin user
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      updated_at = now(),
      encrypted_password = crypt('Admin123!', gen_salt('bf'))
    WHERE id = admin_uid;
  END IF;

  -- Ensure admin exists in public.users with proper role
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
    is_platform_admin = true;

END $$;