-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Self read access" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admin access" ON users;
DROP POLICY IF EXISTS "Public read access for basic info" ON users;

-- Create simplified policies without recursion
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin full access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@reallive.app'
    )
  );

CREATE POLICY "Public read access for profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    role IN ('dj', 'promoter', 'creator')
  );