-- Drop all existing policies
DROP POLICY IF EXISTS "Read own data" ON users;
DROP POLICY IF EXISTS "Read public profiles" ON users;
DROP POLICY IF EXISTS "Update own data" ON users;
DROP POLICY IF EXISTS "Admin full access" ON users;

-- Create final, non-recursive policies
CREATE POLICY "Basic data access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    auth.uid() = id OR
    -- Or if they are viewing a public profile
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "Self update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin management"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Use JWT claim directly for admin check
    auth.jwt() ->> 'email' = 'admin@reallive.app'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@reallive.app'
  );

-- Ensure index exists for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);