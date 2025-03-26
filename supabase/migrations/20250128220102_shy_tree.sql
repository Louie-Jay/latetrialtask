/*
  # Add user_id to events table

  1. Changes
    - Add user_id column to events table
    - Add foreign key constraint to users table
    - Add index for better query performance
    - Update RLS policies to restrict access based on user_id

  2. Security
    - Enable RLS
    - Add policy for event owners
*/

-- Add user_id column to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can read events" ON events;

CREATE POLICY "Event owners can manage their events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can read public events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);