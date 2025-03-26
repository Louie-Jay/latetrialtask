-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Self read access" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users with admin role have full access" ON users;

-- Create simplified policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    email = 'admin@reallive.app'
  )
  WITH CHECK (
    email = 'admin@reallive.app'
  );

CREATE POLICY "Public read access for basic info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);