/*
  # Add Payment Routing Configuration

  1. New Tables
    - `payment_routes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `percentage` (numeric)
      - `destination_account` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `payment_routes` table
    - Add policy for admins to manage routes
    - Add policy for authenticated users to read routes
*/

CREATE TABLE IF NOT EXISTS payment_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  percentage numeric NOT NULL,
  destination_account text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_routes ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage payment routes
CREATE POLICY "Admins can manage payment routes"
  ON payment_routes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow authenticated users to read payment routes
CREATE POLICY "Authenticated users can read payment routes"
  ON payment_routes
  FOR SELECT
  TO authenticated
  USING (true);

-- Add initial payment routes
INSERT INTO payment_routes (name, description, percentage, destination_account)
VALUES
  ('Primary Payment', 'Main payment for ticket sales', 100, 'primary_account'),
  ('Service Fee', 'Additional service fee', 10, 'service_fee_account');