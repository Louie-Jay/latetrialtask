/*
# Core Tables Setup

1. New Tables
  - Events table for storing event information
  - Venues table for venue details
  - Tickets table for ticket purchases
  
2. Security
  - Enable RLS on all tables
  - Add policies for proper access control
  - Add indexes for performance
*/

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  venue text NOT NULL,
  event_date timestamptz NOT NULL,
  individual_price numeric NOT NULL,
  group_price numeric,
  discount_code text,
  image_url text,
  tickets_sold integer DEFAULT 0,
  capacity integer NOT NULL,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text NOT NULL,
  capacity integer NOT NULL,
  image_url text,
  amenities text[],
  upcoming_events_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES users(id),
  qr_code text NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  price_paid numeric NOT NULL,
  is_group_ticket boolean DEFAULT false,
  status text DEFAULT 'active',
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Events policies
    DROP POLICY IF EXISTS "Anyone can read events" ON events;
    DROP POLICY IF EXISTS "Event owners can manage events" ON events;
    
    -- Venues policies
    DROP POLICY IF EXISTS "Anyone can read venues" ON venues;
    
    -- Tickets policies
    DROP POLICY IF EXISTS "Users can read own tickets" ON tickets;
    DROP POLICY IF EXISTS "Users can purchase tickets" ON tickets;
END $$;

-- Create policies
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Event owners can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read venues"
  ON venues
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can purchase tickets"
  ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_events_date;
DROP INDEX IF EXISTS idx_events_venue;
DROP INDEX IF EXISTS idx_tickets_event;
DROP INDEX IF EXISTS idx_tickets_user;
DROP INDEX IF EXISTS idx_tickets_status;

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_venue ON events(venue);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);