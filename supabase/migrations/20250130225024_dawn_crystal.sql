-- First remove any existing payment routes
DELETE FROM payment_routes;

-- Add new payment routes with correct splits
INSERT INTO payment_routes (name, description, percentage, destination_account)
VALUES
  ('Platform Fee', 'Platform service fee (additional 10%)', 0, 'platform_account'),  -- 0% of base amount
  ('Professional Share', 'DJ/Promoter/Creator share', 100, 'professional_account');   -- 100% of base amount

-- Add service fee configuration
ALTER TABLE payment_routes
  ADD COLUMN IF NOT EXISTS service_fee_percentage numeric;

-- Set platform service fee
UPDATE payment_routes
SET service_fee_percentage = 10
WHERE name = 'Platform Fee';

-- Add constraint to ensure only one service fee configuration
ALTER TABLE payment_routes
  ADD CONSTRAINT single_service_fee 
    UNIQUE (service_fee_percentage)
    DEFERRABLE INITIALLY DEFERRED;

-- Add helpful comment
COMMENT ON TABLE payment_routes IS 
'Configures payment routing where professionals receive 100% of ticket price
and platform takes an additional 10% service fee.
Example: $100 ticket
- Professional receives: $100 (100%)
- Platform receives: $10 (10% service fee)
- Customer pays: $110 total';

-- Update payment_transactions to track fees separately
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS professional_amount numeric,
  ADD COLUMN IF NOT EXISTS platform_fee numeric;

-- Add function to calculate platform fee
CREATE OR REPLACE FUNCTION calculate_platform_fee(base_amount numeric)
RETURNS numeric AS $$
DECLARE
  fee_percentage numeric;
BEGIN
  SELECT service_fee_percentage INTO fee_percentage
  FROM payment_routes
  WHERE name = 'Platform Fee'
  LIMIT 1;
  
  RETURN ROUND(base_amount * (fee_percentage / 100.0), 2);
END;
$$ LANGUAGE plpgsql;