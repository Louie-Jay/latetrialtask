/*
  # Add Reward Tables

  1. New Tables
    - reward_tiers
      - id (uuid, primary key)
      - name (text)
      - points_threshold (integer)
      - description (text)
      - icon (text)
      - created_at (timestamp)
    
    - reward_benefits
      - id (uuid, primary key)
      - tier_id (uuid, foreign key)
      - name (text)
      - description (text)
      - benefit_type (text)
      - value (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
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

CREATE POLICY "Anyone can read reward tiers"
  ON reward_tiers
  FOR SELECT
  TO authenticated
  USING (true);

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

CREATE POLICY "Anyone can read reward benefits"
  ON reward_benefits
  FOR SELECT
  TO authenticated
  USING (true);