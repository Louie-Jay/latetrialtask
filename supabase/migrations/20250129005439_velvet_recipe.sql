-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Public read access for profiles" ON users;

-- Create final, simplified policies
CREATE POLICY "Basic user access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    auth.uid() = id OR
    -- Or read public profiles
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "Admin full access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Direct check against auth.users table
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@reallive.app'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@reallive.app'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);