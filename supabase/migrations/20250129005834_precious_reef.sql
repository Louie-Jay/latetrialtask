-- Drop all existing policies
DROP POLICY IF EXISTS "Basic read access" ON users;
DROP POLICY IF EXISTS "Self update access" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;

-- Create simplified policies that avoid recursion
CREATE POLICY "Read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own profile
    auth.uid() = id
  );

CREATE POLICY "Read public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Anyone can read public profiles (djs, promoters, creators)
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "Update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin full access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Use JWT claim directly to check admin status
    auth.jwt() ->> 'email' = 'admin@reallive.app'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@reallive.app'
  );

-- Ensure index exists for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);