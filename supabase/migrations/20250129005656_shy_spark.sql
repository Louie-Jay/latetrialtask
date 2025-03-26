-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Public profile access" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;

-- Create final, simplified policies using JWT claims directly
CREATE POLICY "Basic read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own data
    auth.uid() = id OR
    -- Or if the user is a public profile (dj, promoter, creator)
    role IN ('dj', 'promoter', 'creator')
  );

CREATE POLICY "Self update access"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@reallive.app'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@reallive.app'
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);