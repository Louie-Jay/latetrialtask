/*
  # Add ticket sharing, social media, and payment tracking

  1. New Tables
    - `ticket_shares`
      - Track ticket sharing between users
      - Record bonus points for referrals
    - `social_shares`
      - Track when users share tickets on social media
      - Record bonus points earned
    - `payment_transactions`
      - Record all payment details
      - Track service fees

  2. Changes
    - Add `shared_by` and `shared_at` columns to tickets table
    - Add `points_earned` column to tickets table

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Ticket Shares Table
CREATE TABLE IF NOT EXISTS ticket_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id),
  shared_by uuid REFERENCES users(id),
  shared_to uuid REFERENCES users(id),
  bonus_points integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their shared tickets"
  ON ticket_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() = shared_by OR auth.uid() = shared_to);

-- Social Shares Table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  ticket_id uuid REFERENCES tickets(id),
  platform text NOT NULL,
  share_url text,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id),
  user_id uuid REFERENCES users(id),
  amount numeric NOT NULL,
  service_fee numeric NOT NULL,
  status text DEFAULT 'pending',
  provider text NOT NULL,
  provider_transaction_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add columns to tickets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'shared_by'
  ) THEN
    ALTER TABLE tickets ADD COLUMN shared_by uuid REFERENCES users(id);
    ALTER TABLE tickets ADD COLUMN shared_at timestamptz;
    ALTER TABLE tickets ADD COLUMN points_earned integer DEFAULT 0;
  END IF;
END $$;

-- Functions for points management
CREATE OR REPLACE FUNCTION calculate_sharing_points()
RETURNS trigger AS $$
BEGIN
  -- Award points for sharing tickets
  IF NEW.status = 'accepted' THEN
    -- Check if recipient is a new user
    IF NOT EXISTS (
      SELECT 1 FROM tickets 
      WHERE user_id = NEW.shared_to 
      AND id != NEW.ticket_id
    ) THEN
      -- Award bonus points for referring new user
      UPDATE users 
      SET points = points + NEW.bonus_points
      WHERE id = NEW.shared_by;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_ticket_share_accepted
  AFTER UPDATE ON ticket_shares
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'accepted')
  EXECUTE FUNCTION calculate_sharing_points();

-- Function to award points for social shares
CREATE OR REPLACE FUNCTION award_social_share_points()
RETURNS trigger AS $$
BEGIN
  UPDATE users 
  SET points = points + NEW.points_earned
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_social_share_created
  AFTER INSERT ON social_shares
  FOR EACH ROW
  EXECUTE FUNCTION award_social_share_points();