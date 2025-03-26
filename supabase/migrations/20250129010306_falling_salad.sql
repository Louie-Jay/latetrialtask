-- Drop all existing policies
DROP POLICY IF EXISTS "Basic data access" ON users;
DROP POLICY IF EXISTS "Self update" ON users;
DROP POLICY IF EXISTS "Admin management" ON users;

-- Create final, non-recursive policies using direct JWT claims
CREATE POLICY "Read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    id = auth.uid() OR
    -- Or if the profile is public (dj, promoter, creator)
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "Self update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Direct JWT claim check for admin
    auth.email() = 'admin@reallive.app'
  )
  WITH CHECK (
    auth.email() = 'admin@reallive.app'
  );

-- Ensure index exists for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);