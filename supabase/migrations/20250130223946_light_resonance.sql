-- First, disable RLS temporarily to avoid any conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Add platform admin flag if it doesn't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_platform_admin boolean DEFAULT false;

-- Set initial platform admin
UPDATE users 
SET is_platform_admin = true
WHERE email = 'admin@reallive.app';

-- Create simplified policies
CREATE POLICY "read_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR                           -- Own profile
    role IN ('dj', 'promoter', 'creator') OR     -- Public profiles
    is_platform_admin = true                     -- Platform admin
  );

CREATE POLICY "insert_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR                          -- Own profile
    is_platform_admin = true                    -- Platform admin
  );

CREATE POLICY "update_policy"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    is_platform_admin = true OR                 -- Platform admin can update anything
    (auth.uid() = id AND                        -- Users can update own profile
     NOT EXISTS (                               -- But can't modify platform_admin status
       SELECT 1 FROM users
       WHERE id = auth.uid() 
       AND is_platform_admin = true
     ))
  );

CREATE POLICY "delete_policy"
  ON users
  FOR DELETE
  TO authenticated
  USING (is_platform_admin = true);             -- Only platform admins can delete

-- Add index for platform admin lookups
CREATE INDEX IF NOT EXISTS idx_users_platform_admin ON users(is_platform_admin);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add helpful comment
COMMENT ON COLUMN users.is_platform_admin IS 
'Indicates whether the user is a platform admin with full access rights.
Platform admins can:
1. Manage other platform admins
2. Access all user data
3. Modify any user profile
4. Delete user accounts
This is separate from payment routing configuration.';