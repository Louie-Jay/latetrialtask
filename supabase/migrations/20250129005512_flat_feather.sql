-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Basic user access" ON users;
DROP POLICY IF EXISTS "Admin full access" ON users;

-- Create final, non-recursive policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    auth.uid() = id
  );

CREATE POLICY "Public profile access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Anyone can read public profiles
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "Admin access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Direct check against auth.users email
    auth.jwt() ->> 'email' = 'admin@reallive.app'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@reallive.app'
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);