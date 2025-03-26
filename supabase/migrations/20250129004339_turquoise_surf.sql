-- Add Stripe Connect fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_account_requirements text[],
  ADD COLUMN IF NOT EXISTS stripe_account_created_at timestamptz;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON users(stripe_account_id);

-- Add RLS policy for Stripe fields
CREATE POLICY "Users can read their own Stripe data"
  ON users
  FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Create Stripe onboarding status view
CREATE VIEW stripe_onboarding_status AS
SELECT
  u.id,
  u.email,
  u.role,
  u.stripe_account_id,
  u.stripe_account_status,
  u.stripe_account_requirements,
  u.stripe_account_created_at,
  CASE
    WHEN u.stripe_account_id IS NULL THEN 'not_started'
    WHEN u.stripe_account_status = 'pending' THEN 'pending'
    WHEN array_length(u.stripe_account_requirements, 1) > 0 THEN 'incomplete'
    ELSE 'complete'
  END as onboarding_status
FROM users u
WHERE u.role IN ('dj', 'promoter', 'creator');