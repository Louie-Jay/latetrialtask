-- Add revenue share tracking for collaborators
CREATE TABLE IF NOT EXISTS collaborator_revenue_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  collaborator_id uuid REFERENCES users(id),
  share_percentage numeric NOT NULL CHECK (share_percentage BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE collaborator_revenue_shares ENABLE ROW LEVEL SECURITY;

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
BEGIN
  -- Check if total shares for event exceed 100%
  IF (
    SELECT SUM(share_percentage)
    FROM collaborator_revenue_shares
    WHERE event_id = NEW.event_id
  ) > 100 THEN
    RAISE EXCEPTION 'Total revenue shares cannot exceed 100%%';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate shares
CREATE TRIGGER check_revenue_shares
  BEFORE INSERT OR UPDATE ON collaborator_revenue_shares
  FOR EACH ROW
  EXECUTE FUNCTION validate_revenue_shares();

-- Add function to calculate payment splits
CREATE OR REPLACE FUNCTION calculate_payment_split(
  event_id uuid,
  base_amount numeric
)
RETURNS TABLE (
  recipient_id uuid,
  amount numeric,
  share_type text
) AS $$
DECLARE
  event_owner_id uuid;
  platform_fee numeric;
  remaining_amount numeric;
BEGIN
  -- Get event owner
  SELECT user_id INTO event_owner_id
  FROM events
  WHERE id = event_id;

  -- Calculate platform fee (10%)
  platform_fee := ROUND(base_amount * 0.1, 2);
  
  -- Return platform fee split
  recipient_id := NULL; -- Platform fee goes to platform account
  amount := platform_fee;
  share_type := 'platform_fee';
  RETURN NEXT;

  -- Calculate collaborator shares
  FOR recipient_id, amount IN
    SELECT 
      collaborator_id,
      ROUND(base_amount * (share_percentage / 100.0), 2)
    FROM collaborator_revenue_shares
    WHERE event_id = event_id
  LOOP
    share_type := 'collaborator';
    RETURN NEXT;
  END LOOP;

  -- Calculate remaining amount for event owner
  remaining_amount := base_amount - (
    SELECT COALESCE(SUM(ROUND(base_amount * (share_percentage / 100.0), 2)), 0)
    FROM collaborator_revenue_shares
    WHERE event_id = event_id
  );

  -- Return event owner's share
  recipient_id := event_owner_id;
  amount := remaining_amount;
  share_type := 'owner';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_payment_split IS 
'Calculates payment splits for event tickets including collaborator shares.
Returns table of:
- recipient_id: UUID of recipient (NULL for platform)
- amount: Amount to pay this recipient
- share_type: Type of share (platform_fee, collaborator, owner)

Example splits for $100 ticket:
- Platform gets $10 (10% fee)
- Collaborator 1 gets $30 (30%)
- Collaborator 2 gets $30 (30%)
- Event owner gets $40 (remaining 40%)
- Total paid by customer: $110';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collaborator_shares_event ON collaborator_revenue_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_shares_user ON collaborator_revenue_shares(collaborator_id);