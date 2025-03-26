/*
  # Update admin email address
  
  1. Changes
    - Updates admin email from admin@reallive.app to themvisionstudio@gmail.com
    - Preserves all existing admin permissions and access
    - Non-destructive update that maintains data integrity
  
  2. Security
    - Maintains existing RLS policies
    - Preserves admin access controls
*/

-- Update admin email in auth.users table
UPDATE auth.users 
SET email = 'themvisionstudio@gmail.com',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'admin@reallive.app';

-- Update admin email in public.users table
UPDATE users
SET email = 'themvisionstudio@gmail.com'
WHERE email = 'admin@reallive.app';

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table. Admin user email is themvisionstudio@gmail.com.
This user has full platform admin access and permissions.';

-- Verify the update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'themvisionstudio@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Admin email update failed';
  END IF;
END $$;