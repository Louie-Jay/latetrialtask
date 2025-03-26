-- Drop existing function first
DROP FUNCTION IF EXISTS get_payment_split(uuid, numeric);

-- Add revenue share tracking for collaborators if not exists
CREATE TABLE IF NOT EXISTS collaborator_revenue_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  collaborator_id uuid REFERENCES users(id),
  share_percentage numeric NOT NULL CHECK (share_percentage BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE collaborator_revenue_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Event owners can manage revenue shares" ON collaborator_revenue_shares;
DROP POLICY IF EXISTS "Collaborators can view their shares" ON collaborator_revenue_shares;

-- Add RLS policies
CREATE POLICY "Event owners can manage revenue shares"
  ON collaborator_revenue_shares
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = collaborator_revenue_shares.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view their shares"
  ON collaborator_revenue_shares
  FOR SELECT
  TO authenticated
  USING (collaborator_id = auth.uid());

-- Add function to validate total shares don't exceed 100%
CREATE OR REPLACE FUNCTION validate_revenue_shares()
RETURNS trigger AS $$
DECLARE
  total_shares numeric;
BEGIN
  -- Calculate total shares including new share
  SELECT COALESCE(SUM(share_percentage), 0) INTO total_shares
  FROM collaborator_revenue_shares
  WHERE event_id = NEW.event_id
  AND id != NEW.id;  -- Exclude current record for updates
  
  total_shares := total_shares + NEW.share_percentage;
  
  IF total_shares > 100 THEN
    RAISE EXCEPTION 'Total revenue shares cannot exceed 100%%';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate shares
DROP TRIGGER IF EXISTS check_revenue_shares ON collaborator_revenue_shares;
CREATE TRIGGER check_revenue_shares
  BEFORE INSERT OR UPDATE ON collaborator_revenue_shares
  FOR EACH ROW
  EXECUTE FUNCTION validate_revenue_shares();

-- Add function to calculate payment splits
CREATE FUNCTION get_payment_split(event_id uuid, amount numeric)
RETURNS TABLE (
  recipient_id uuid,
  recipient_amount numeric,
  platform_fee numeric
) AS $$
DECLARE
  fee_percentage numeric;
  event_owner_id uuid;
  remaining_share numeric;
BEGIN
  -- Get platform fee percentage
  SELECT service_fee_percentage INTO fee_percentage
  FROM payment_routes
  WHERE name = 'Platform Fee'
  LIMIT 1;

  -- Get event owner
  SELECT user_id INTO event_owner_id
  FROM events
  WHERE id = event_id;

  -- Calculate platform fee
  platform_fee := ROUND(amount * (fee_percentage / 100.0), 2);

  -- Return collaborator shares
  RETURN QUERY
    SELECT 
      cs.collaborator_id,
      ROUND(amount * (cs.share_percentage / 100.0), 2),
      platform_fee
    FROM collaborator_revenue_shares cs
    WHERE cs.event_id = event_id;

  -- Calculate remaining amount for event owner
  remaining_share := amount - COALESCE((
    SELECT SUM(ROUND(amount * (share_percentage / 100.0), 2))
    FROM collaborator_revenue_shares
    WHERE event_id = event_id
  ), 0);

  -- Return event owner's share
  RETURN QUERY
    SELECT 
      event_owner_id,
      remaining_share,
      platform_fee;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_payment_split IS 
'Calculates payment splits for event tickets including collaborator shares.
- Each collaborator gets their defined percentage of base amount
- Event owner gets remaining percentage
- Platform always takes 10% fee on top
Example: $100 ticket with two collaborators at 30% each
- Collaborator 1: $30 (30%)
- Collaborator 2: $30 (30%) 
- Event owner: $40 (remaining 40%)
- Platform: $10 (10% fee)
- Customer pays: $110 total';