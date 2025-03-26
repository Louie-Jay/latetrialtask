-- Add Stripe-specific fields to payment_transactions
ALTER TABLE payment_transactions
  ADD COLUMN stripe_payment_intent_id text,
  ADD COLUMN stripe_customer_id text;

-- Add index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent ON payment_transactions(stripe_payment_intent_id);

-- Add Stripe account ID to payment routes for connecting payments
ALTER TABLE payment_routes
  ADD COLUMN stripe_account_id text;

-- Update payment routes with Stripe accounts
UPDATE payment_routes
SET stripe_account_id = CASE
  WHEN name = 'Primary Payment' THEN 'acct_primary'  -- Replace with actual Stripe account
  WHEN name = 'Service Fee' THEN 'acct_platform'     -- Platform's Stripe account
  ELSE NULL
END;