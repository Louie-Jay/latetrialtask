-- Drop all existing policies
DROP POLICY IF EXISTS "Read access" ON users;
DROP POLICY IF EXISTS "Update access" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;

-- Create final, simplified policies without recursion
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

CREATE POLICY "Update access"
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
    -- Use auth.email() directly without recursion
    auth.email() = 'admin@reallive.app'
  )
  WITH CHECK (
    auth.email() = 'admin@reallive.app'
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);