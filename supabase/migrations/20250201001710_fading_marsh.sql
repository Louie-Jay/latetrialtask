-- Add ticket timing and special offers configuration
CREATE TYPE ticket_restriction AS ENUM ('none', 'male', 'female');

CREATE TABLE IF NOT EXISTS ticket_timing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  restriction ticket_restriction DEFAULT 'none',
  max_tickets integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ticket_timing_rules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Event owners can manage ticket rules"
  ON ticket_timing_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_timing_rules.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view ticket rules"
  ON ticket_timing_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- Add function to get current ticket price
CREATE OR REPLACE FUNCTION get_current_ticket_price(
  event_id uuid,
  restriction ticket_restriction DEFAULT 'none'
)
RETURNS numeric AS $$
DECLARE
  current_price numeric;
BEGIN
  -- Check for active timing rule
  SELECT price INTO current_price
  FROM ticket_timing_rules
  WHERE ticket_timing_rules.event_id = get_current_ticket_price.event_id
    AND now() BETWEEN start_time AND end_time
    AND (restriction = 'none' OR restriction = get_current_ticket_price.restriction)
    AND (max_tickets IS NULL OR (
      SELECT COUNT(*)
      FROM tickets
      WHERE tickets.event_id = get_current_ticket_price.event_id
    ) < max_tickets)
  ORDER BY price ASC
  LIMIT 1;

  -- If no active timing rule, return regular price
  IF current_price IS NULL THEN
    SELECT individual_price INTO current_price
    FROM events
    WHERE id = get_current_ticket_price.event_id;
  END IF;

  RETURN current_price;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON TABLE ticket_timing_rules IS 
'Configures special ticket pricing rules based on time and restrictions.
Examples:
- Free tickets before 10pm
- Free entry for females before 11pm
- Early bird pricing until event day
Each rule has:
- Time window (start/end)
- Special price
- Optional gender restriction
- Optional maximum tickets';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_timing_event_id ON ticket_timing_rules(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_timing_time_window 
  ON ticket_timing_rules(start_time, end_time);