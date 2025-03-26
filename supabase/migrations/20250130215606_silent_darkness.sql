-- First, disable RLS temporarily to avoid any conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Create a single, ultra-simple policy
CREATE POLICY "users_policy"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Simple OR conditions without any function calls or complex logic
    id = auth.uid() OR                                    -- Own profile
    role IN ('dj', 'promoter', 'creator') OR             -- Public profiles
    current_setting('request.jwt.claims')::json->>'email' = 'admin@reallive.app'  -- Admin
  )
  WITH CHECK (
    -- Simple OR conditions for write operations
    id = auth.uid() OR                                    -- Own profile
    current_setting('request.jwt.claims')::json->>'email' = 'admin@reallive.app'  -- Admin
  );

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ensure indexes exist for performance
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role_id;
DROP INDEX IF EXISTS idx_users_email_id;

-- Create a single composite index that covers all our access patterns
CREATE INDEX idx_users_access ON users(id, role, email);

-- Add helpful comment
COMMENT ON POLICY users_policy ON users IS 
'Simple, non-recursive policy that:
1. Allows users to read their own profile
2. Allows reading of public profiles (dj, promoter, creator)
3. Gives admin full access
4. Uses direct JWT claims for admin checks
5. Avoids function calls and complex logic';