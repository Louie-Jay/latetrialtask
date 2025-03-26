-- Drop existing policies
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "Read access" ON users;
DROP POLICY IF EXISTS "Update access" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;

-- Create simplified admin policies
CREATE POLICY "admin_access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    auth.email() = 'themvisionstudio@gmail.com'
  )
  WITH CHECK (
    auth.email() = 'themvisionstudio@gmail.com'
  );

CREATE POLICY "user_access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "self_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Add helpful comment
COMMENT ON TABLE users IS 
'User profiles table with RLS policies:
1. Admin (themvisionstudio@gmail.com) has full access
2. Users can read public profiles (dj, promoter, creator)
3. Users can read and update their own profiles';

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);