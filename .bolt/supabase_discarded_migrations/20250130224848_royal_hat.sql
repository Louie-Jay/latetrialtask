-- Remove the default 100% payment route
DELETE FROM payment_routes 
WHERE percentage = 100 
AND name = 'Primary Payment';

-- Add new default payment routes with more granular splits
INSERT INTO payment_routes (name, description, percentage, destination_account)
VALUES
  ('Platform Fee', 'Platform service fee', 10, 'platform_account'),
  ('Creator Share', 'Content creator revenue share', 15, 'creator_account'),
  ('Event Host', 'Event organizer share', 75, 'host_account');

-- Add columns for flexible routing
ALTER TABLE payment_routes
  ADD COLUMN IF NOT EXISTS min_percentage numeric,
  ADD COLUMN IF NOT EXISTS max_percentage numeric,
  ADD COLUMN IF NOT EXISTS is_negotiable boolean DEFAULT false;

-- Update payment routes with constraints
UPDATE payment_routes
SET 
  min_percentage = CASE 
    WHEN name = 'Platform Fee' THEN 5
    WHEN name = 'Creator Share' THEN 10
    WHEN name = 'Event Host' THEN 70
    ELSE NULL
  END,
  max_percentage = CASE
    WHEN name = 'Platform Fee' THEN 15
    WHEN name = 'Creator Share' THEN 20
    WHEN name = 'Event Host' THEN 85
    ELSE NULL
  END,
  is_negotiable = CASE
    WHEN name = 'Platform Fee' THEN false
    ELSE true
  END;

-- Add constraints to ensure valid percentages
ALTER TABLE payment_routes
  ADD CONSTRAINT valid_percentage_range 
    CHECK (percentage BETWEEN min_percentage AND max_percentage);

-- Add constraint to ensure percentages sum to 100%
CREATE OR REPLACE FUNCTION check_total_percentage()
RETURNS trigger AS $$
BEGIN
  IF (
    SELECT SUM(percentage)
    FROM payment_routes
    WHERE is_active = true
  ) != 100 THEN
    RAISE EXCEPTION 'Total percentage must equal 100%%';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_total_percentage
  AFTER INSERT OR UPDATE ON payment_routes
  FOR EACH ROW
  EXECUTE FUNCTION check_total_percentage();

-- Add helpful comment
COMMENT ON TABLE payment_routes IS 
'Configures payment routing with flexible splits between platform, creators, and event hosts.
- Platform Fee: Fixed platform service fee
- Creator Share: Negotiable share for content creators
- Event Host: Primary share for event organizers
All active routes must sum to 100%';