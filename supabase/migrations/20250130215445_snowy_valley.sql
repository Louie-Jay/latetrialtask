-- Drop any conflicting policies that might have been created
DROP POLICY IF EXISTS "user_access_policy" ON users;

-- Create a single, comprehensive policy that avoids recursion
CREATE POLICY "user_access_policy_v2"
  ON users
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (
    CASE
      -- Admin access via direct JWT claim check
      WHEN current_setting('request.jwt.claims', true)::json->>'email' = 'admin@reallive.app' THEN true
      -- Users can read public profiles and their own data
      WHEN current_setting('request.method', true) = 'GET' AND (
        role IN ('dj', 'promoter', 'creator') OR 
        id = auth.uid()
      ) THEN true
      -- Users can only update their own profile
      WHEN current_setting('request.method', true) IN ('PUT', 'PATCH') AND 
        id = auth.uid() THEN true
      ELSE false
    END
  )
  WITH CHECK (
    CASE
      -- Admin can modify anything
      WHEN current_setting('request.jwt.claims', true)::json->>'email' = 'admin@reallive.app' THEN true
      -- Users can only modify their own profile
      WHEN id = auth.uid() THEN true
      ELSE false
    END
  );

-- Add function to safely get JWT claims
CREATE OR REPLACE FUNCTION get_jwt_claim(claim text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::json->>claim, ''),
    nullif(current_setting('request.jwt.claim.' || claim, true), '')
  );
$$;

-- Add helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT get_jwt_claim('email') = 'admin@reallive.app';
$$;

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role, id);
CREATE INDEX IF NOT EXISTS idx_users_email_id ON users(email, id);

-- Add comment explaining the policy
COMMENT ON POLICY "user_access_policy_v2" ON users IS 
'Unified access policy that:
1. Gives admins full access via direct JWT claim check
2. Allows users to read public profiles (dj, promoter, creator)
3. Allows users to read and update their own profile
4. Prevents recursion by using direct JWT claims
5. Uses separate USING and WITH CHECK conditions for precise control';