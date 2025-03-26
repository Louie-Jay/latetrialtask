/*
  # Fix Admin Policies - Final Version

  1. Changes
    - Drops all existing policies
    - Creates non-recursive policies using a materialized view
    - Separates admin check logic from policies
  
  2. Security
    - Maintains proper access control
    - Eliminates recursion completely
    - Preserves admin and user privileges
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users with admin role have full access" ON users;
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Self read access" ON users;

-- Create a materialized view for admin users
DROP MATERIALIZED VIEW IF EXISTS admin_users;
CREATE MATERIALIZED VIEW admin_users AS
SELECT id
FROM users
WHERE email = 'admin@reallive.app' 
  AND role = 'admin';

-- Create index for better performance
CREATE UNIQUE INDEX admin_users_id_idx ON admin_users (id);

-- Create function to refresh admin users view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW admin_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh admin users view
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON users;
CREATE TRIGGER refresh_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users();

-- Create new simplified policies using the materialized view
CREATE POLICY "Admin full access"
  ON users
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Self read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE id = auth.uid()
    )
  );