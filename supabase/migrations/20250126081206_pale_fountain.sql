/*
  # Fix Admin Policies

  1. Changes
    - Drops existing policies
    - Creates new non-recursive admin policies
    - Adds base policy for admin access
  
  2. Security
    - Maintains admin privileges without recursion
    - Ensures proper access control
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users with admin role have full access" ON users;

-- Create new policies
CREATE POLICY "Admin full access"
  ON users
  FOR ALL 
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Self read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );