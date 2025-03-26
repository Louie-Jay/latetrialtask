/*
# Rewards System Setup

1. New Tables
  - reward_tiers: Defines reward levels (Bronze, Silver, etc)
  - reward_benefits: Benefits for each tier
  - reward_usages: Tracks when users use their rewards

2. Security
  - Enable RLS on all tables
  - Add policies for proper access control
  - Add indexes for performance

3. Initial Data
  - Create default tiers (Bronze to Platinum)
  - Add default benefits for each tier
*/

-- Reward Tiers Table
CREATE TABLE IF NOT EXISTS reward_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  points_threshold integer NOT NULL,
  description text,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reward_tiers ENABLE ROW LEVEL SECURITY;

-- Reward Benefits Table
CREATE TABLE IF NOT EXISTS reward_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid REFERENCES reward_tiers(id),
  name text NOT NULL,
  description text,
  benefit_type text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reward_benefits ENABLE ROW LEVEL SECURITY;

-- Reward Usage Table
CREATE TABLE IF NOT EXISTS reward_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  benefit_id uuid REFERENCES reward_benefits(id),
  event_id uuid REFERENCES events(id),
  used_at timestamptz DEFAULT now(),
  points_earned integer DEFAULT 0
);

ALTER TABLE reward_usages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can read reward tiers" ON reward_tiers;
    DROP POLICY IF EXISTS "Anyone can read reward benefits" ON reward_benefits;
    DROP POLICY IF EXISTS "Users can read own reward usage" ON reward_usages;
END $$;

-- Create policies
CREATE POLICY "Anyone can read reward tiers"
  ON reward_tiers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read reward benefits"
  ON reward_benefits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own reward usage"
  ON reward_usages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Drop existing data if needed
TRUNCATE reward_benefits CASCADE;
TRUNCATE reward_tiers CASCADE;

-- Insert initial reward tiers
INSERT INTO reward_tiers (name, points_threshold, description, icon) VALUES
  ('Bronze', 0, 'Welcome to Real L!VE Rewards', 'star'),
  ('Silver', 1000, 'Unlock exclusive perks', 'star'),
  ('Gold', 2500, 'Premium benefits await', 'crown'),
  ('Platinum', 5000, 'Ultimate VIP experience', 'crown');

-- Insert initial benefits
DO $$
DECLARE
  bronze_id uuid;
  silver_id uuid;
  gold_id uuid;
  platinum_id uuid;
BEGIN
  SELECT id INTO bronze_id FROM reward_tiers WHERE name = 'Bronze';
  SELECT id INTO silver_id FROM reward_tiers WHERE name = 'Silver';
  SELECT id INTO gold_id FROM reward_tiers WHERE name = 'Gold';
  SELECT id INTO platinum_id FROM reward_tiers WHERE name = 'Platinum';

  INSERT INTO reward_benefits (tier_id, name, description, benefit_type, value) VALUES
    (bronze_id, 'Early Access', 'Get access to ticket pre-sales', 'feature', 'early_access'),
    (silver_id, 'Ticket Discount', 'Get 5% off tickets', 'discount', '5'),
    (gold_id, 'VIP Discount', 'Get 10% off tickets', 'discount', '10'),
    (platinum_id, 'Elite Discount', 'Get 15% off tickets', 'discount', '15');
END $$;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_reward_tiers_points;
DROP INDEX IF EXISTS idx_reward_benefits_tier;
DROP INDEX IF EXISTS idx_reward_usages_user;

-- Create indexes for better performance
CREATE INDEX idx_reward_tiers_points ON reward_tiers(points_threshold);
CREATE INDEX idx_reward_benefits_tier ON reward_benefits(tier_id);
CREATE INDEX idx_reward_usages_user ON reward_usages(user_id);