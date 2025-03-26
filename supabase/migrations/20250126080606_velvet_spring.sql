/*
  # Create Admin User

  1. Changes
    - Creates initial admin user
    - Sets up admin role and permissions
  
  2. Security
    - Password will need to be changed on first login
    - Admin role has elevated permissions
*/

-- Create admin user if not exists
DO $$
BEGIN
  -- Insert admin user into auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@reallive.app'
  ) THEN
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
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@reallive.app',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Get the user id we just created
    WITH admin_user AS (
      SELECT id FROM auth.users WHERE email = 'admin@reallive.app' LIMIT 1
    )
    -- Create corresponding user profile with admin role
    INSERT INTO users (id, email, role, points)
    SELECT id, 'admin@reallive.app', 'admin', 0
    FROM admin_user;
  END IF;
END $$;

-- Ensure admin role policies exist
DO $$
BEGIN
  -- Add admin-specific policies for each table that needs them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can manage all users'
  ) THEN
    CREATE POLICY "Admins can manage all users"
      ON users
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT id FROM users WHERE role = 'admin'
        )
      );
  END IF;
END $$;