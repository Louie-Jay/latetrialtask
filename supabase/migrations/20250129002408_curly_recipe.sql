-- Create event collaborators table
CREATE TABLE IF NOT EXISTS event_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('dj', 'promoter', 'creator')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Event owners can manage collaborators"
  ON event_collaborators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_collaborators.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view their events"
  ON event_collaborators
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_collaborators.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Add notification for collaborator invites
CREATE OR REPLACE FUNCTION notify_collaborator()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  SELECT
    NEW.user_id,
    'collaborator_invite',
    'Event Collaboration Invite',
    'You have been invited to collaborate on ' || events.name,
    jsonb_build_object(
      'event_id', NEW.event_id,
      'event_name', events.name,
      'role', NEW.role
    )
  FROM events
  WHERE events.id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for collaborator notifications
CREATE TRIGGER on_collaborator_added
  AFTER INSERT ON event_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION notify_collaborator();

-- Add function to handle collaboration responses
CREATE OR REPLACE FUNCTION handle_collaboration_response()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    -- Create notification for event owner
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    )
    SELECT
      events.user_id,
      'collaborator_accepted',
      'Collaboration Accepted',
      users.full_name || ' has accepted your collaboration invite for ' || events.name,
      jsonb_build_object(
        'event_id', NEW.event_id,
        'event_name', events.name,
        'collaborator_id', NEW.user_id,
        'collaborator_name', users.full_name,
        'role', NEW.role
      )
    FROM events
    JOIN users ON users.id = NEW.user_id
    WHERE events.id = NEW.event_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for collaboration responses
CREATE TRIGGER on_collaboration_response
  AFTER UPDATE ON event_collaborators
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('accepted', 'declined'))
  EXECUTE FUNCTION handle_collaboration_response();

-- Add data column to notifications for additional context
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS data jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_collaborators_event_id ON event_collaborators(event_id);
CREATE INDEX IF NOT EXISTS idx_event_collaborators_user_id ON event_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_event_collaborators_status ON event_collaborators(status);