/*
  # Initial Schema Setup

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text)
      - role (text)
      - points (integer)
      - created_at (timestamp)
    
    - events
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - venue (text)
      - event_date (timestamp)
      - individual_price (numeric)
      - group_price (numeric)
      - discount_code (text)
      - image_url (text)
      - tickets_sold (integer)
      - capacity (integer)
      - created_at (timestamp)
    
    - venues
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - address (text)
      - capacity (integer)
      - image_url (text)
      - amenities (text[])
      - upcoming_events_count (integer)
      - created_at (timestamp)
    
    - tickets
      - id (uuid, primary key)
      - event_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - qr_code (text)
      - purchase_date (timestamp)
      - price_paid (numeric)
      - is_group_ticket (boolean)
      - status (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users Table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role text DEFAULT 'user',
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Events Table
CREATE TABLE events (
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
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Venues Table
CREATE TABLE venues (
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

CREATE POLICY "Anyone can read venues"
  ON venues
  FOR SELECT
  TO authenticated
  USING (true);

-- Tickets Table
CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES users(id),
  qr_code text NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  price_paid numeric NOT NULL,
  is_group_ticket boolean DEFAULT false,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets"
  ON tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);