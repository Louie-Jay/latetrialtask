/*
  # Add full_name column to users table

  1. Changes
    - Add full_name column to users table if it doesn't exist
    - Add index for better performance on name searches
    - Update existing users with email as full_name if null

  2. Security
    - No changes to RLS policies needed
*/

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name text;
  END IF;
END $$;

-- Create index for name searches
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

-- Update existing users to have a default full_name if null
UPDATE users 
SET full_name = email 
WHERE full_name IS NULL;