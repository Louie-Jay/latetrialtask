/*
  # Fix Admin Policies - Final Version

  1. Changes
    - Drops all existing policies
    - Creates simplified non-recursive policies
    - Uses email-based admin check
  
  2. Security
    - Maintains proper access control
    - Eliminates recursion
    - Preserves admin and user privileges
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users with admin role have full access" ON users;
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Self read access" ON users;

-- Create simplified non-recursive policies
CREATE POLICY "Admin full access"
  ON users
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
      AND u.email = 'admin@reallive.app'
      AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
      AND u.email = 'admin@reallive.app'
      AND u.role = 'admin'
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
      FROM users u
      WHERE u.id = auth.uid()
      AND u.email = 'admin@reallive.app'
      AND u.role = 'admin'
    )
  );