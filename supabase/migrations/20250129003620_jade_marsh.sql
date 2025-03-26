-- Create reward usage table if not exists
CREATE TABLE IF NOT EXISTS reward_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id),
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES users(id),
  reward_id uuid REFERENCES reward_benefits(id),
  discount_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reward_usages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view their reward usages" ON reward_usages;

-- Create new policy
CREATE POLICY "Users can view their reward usages"
  ON reward_usages
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = reward_usages.event_id
      AND events.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM event_collaborators
      WHERE event_collaborators.event_id = reward_usages.event_id
      AND event_collaborators.user_id = auth.uid()
      AND event_collaborators.status = 'accepted'
    )
  );

-- Add reward tracking to payment transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_transactions'
    AND column_name = 'reward_usage_id'
  ) THEN
    ALTER TABLE payment_transactions
      ADD COLUMN reward_usage_id uuid REFERENCES reward_usages(id),
      ADD COLUMN reward_discount numeric DEFAULT 0;
  END IF;
END $$;

-- Create reward tracking view for professionals
CREATE OR REPLACE VIEW professional_reward_stats AS
SELECT
  e.user_id as professional_id,
  ec.user_id as collaborator_id,
  ru.reward_id,
  COUNT(*) as usage_count,
  SUM(ru.discount_amount) as total_discount_amount,
  rb.name as reward_name,
  rb.benefit_type,
  rt.name as tier_name
FROM reward_usages ru
JOIN events e ON e.id = ru.event_id
LEFT JOIN event_collaborators ec ON ec.event_id = e.id
JOIN reward_benefits rb ON rb.id = ru.reward_id
JOIN reward_tiers rt ON rt.id = rb.tier_id
WHERE ec.status = 'accepted' OR ec.id IS NULL
GROUP BY
  e.user_id,
  ec.user_id,
  ru.reward_id,
  rb.name,
  rb.benefit_type,
  rt.name;

-- Function to track reward usage
CREATE OR REPLACE FUNCTION track_reward_usage()
RETURNS trigger AS $$
BEGIN
  -- Create notification for event owner and collaborators
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  SELECT DISTINCT
    CASE
      WHEN ec.user_id IS NOT NULL THEN ec.user_id
      ELSE e.user_id
    END,
    'reward_used',
    'Reward Used on Ticket Sale',
    'A ' || rb.name || ' reward was used on a ticket purchase',
    jsonb_build_object(
      'event_id', NEW.event_id,
      'reward_id', NEW.reward_id,
      'discount_amount', NEW.discount_amount,
      'ticket_id', NEW.ticket_id
    )
  FROM events e
  LEFT JOIN event_collaborators ec ON ec.event_id = e.id AND ec.status = 'accepted'
  JOIN reward_benefits rb ON rb.id = NEW.reward_id
  WHERE e.id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_reward_usage ON reward_usages;

-- Create trigger for reward usage notifications
CREATE TRIGGER on_reward_usage
  AFTER INSERT ON reward_usages
  FOR EACH ROW
  EXECUTE FUNCTION track_reward_usage();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reward_usages_event_id ON reward_usages(event_id);
CREATE INDEX IF NOT EXISTS idx_reward_usages_user_id ON reward_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_usages_reward_id ON reward_usages(reward_id);