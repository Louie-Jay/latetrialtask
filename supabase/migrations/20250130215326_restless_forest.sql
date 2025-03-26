-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Read access" ON users;
DROP POLICY IF EXISTS "Update access" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;
DROP POLICY IF EXISTS "Basic access" ON users;
DROP POLICY IF EXISTS "Self update" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Public read access for profiles" ON users;

-- Create a single comprehensive policy for all operations
CREATE POLICY "user_access_policy"
  ON users
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    CASE
      -- Admin can do everything
      WHEN current_setting('request.jwt.claims', true)::json->>'email' = 'admin@reallive.app' THEN true
      -- Users can read public profiles
      WHEN current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated' 
        AND (role IN ('dj', 'promoter', 'creator') OR id = auth.uid()) 
        AND current_setting('request.method', true) = 'GET' THEN true
      -- Users can only update their own profile
      WHEN current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
        AND id = auth.uid()
        AND current_setting('request.method', true) IN ('PUT', 'PATCH') THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE
      -- Admin can do everything
      WHEN current_setting('request.jwt.claims', true)::json->>'email' = 'admin@reallive.app' THEN true
      -- Users can only update their own profile
      WHEN current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
        AND id = auth.uid()
        AND current_setting('request.method', true) IN ('PUT', 'PATCH') THEN true
      ELSE false
    END
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);