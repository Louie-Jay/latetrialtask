-- Add admin title and badge fields to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS admin_title text,
  ADD COLUMN IF NOT EXISTS admin_badge text;

-- Add function to automatically set admin badge when event is created
CREATE OR REPLACE FUNCTION set_admin_badge()
RETURNS trigger AS $$
BEGIN
  -- Check if event creator is an admin (but not platform admin)
  IF EXISTS (
    SELECT 1 FROM users
    WHERE id = NEW.user_id
    AND role = 'admin'
    AND NOT is_platform_admin
  ) THEN
    -- Set admin badge if not already set
    NEW.admin_badge := COALESCE(NEW.admin_badge, 'Official Event');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set admin badge on event creation
CREATE TRIGGER set_event_admin_badge
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_badge();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_events_admin_badge ON events(admin_badge)
WHERE admin_badge IS NOT NULL;

COMMENT ON COLUMN events.admin_title IS 
'Optional title that can be set by admin event creators to highlight their events';

COMMENT ON COLUMN events.admin_badge IS 
'Badge text to show for events created by admins (e.g., "Official Event")';