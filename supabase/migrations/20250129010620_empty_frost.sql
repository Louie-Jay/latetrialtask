-- Drop all existing policies
DROP POLICY IF EXISTS "Basic access" ON users;
DROP POLICY IF EXISTS "Self update" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;

-- Create final, non-recursive policies using auth.uid() directly
CREATE POLICY "Read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Direct comparison with auth.uid()
    id = auth.uid() OR
    -- Simple role check for public profiles
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
    -- Direct check using auth.email()
    auth.email() = 'admin@reallive.app'
  )
  WITH CHECK (
    auth.email() = 'admin@reallive.app'
  );

-- Ensure index exists for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);