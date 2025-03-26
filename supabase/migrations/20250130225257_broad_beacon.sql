-- Add role column to payment routes to track professional role
ALTER TABLE payment_routes
  ADD COLUMN IF NOT EXISTS professional_role text;

-- Update existing routes with role information
UPDATE payment_routes
SET professional_role = CASE
  WHEN name = 'Professional Share' THEN 'professional'
  WHEN name = 'Platform Fee' THEN 'platform'
  ELSE NULL
END;

-- Add function to determine payment split based on user role
CREATE OR REPLACE FUNCTION get_payment_split(user_id uuid, amount numeric)
RETURNS TABLE (
  professional_amount numeric,
  platform_fee numeric
) AS $$
DECLARE
  fee_percentage numeric;
BEGIN
  -- Get platform fee percentage
  SELECT service_fee_percentage INTO fee_percentage
  FROM payment_routes
  WHERE name = 'Platform Fee'
  LIMIT 1;

  -- Calculate amounts
  -- Even if user is admin, they still get standard professional split for their events
  professional_amount := amount;
  platform_fee := ROUND(amount * (fee_percentage / 100.0), 2);

  RETURN QUERY
  SELECT professional_amount, platform_fee;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION get_payment_split IS 
'Calculates payment split for event tickets.
All professionals (including admins) receive 100% of base ticket price.
Platform always takes 10% fee on top.
Example: $100 ticket
- Professional gets $100 (100%) regardless of admin status
- Platform gets $10 (10% fee)
- Customer pays $110 total';