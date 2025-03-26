/*
  # Add Creator Collaboration Support

  1. Changes
    - Add creator role to event_collaborators role check
    - Add creator-specific notification templates
    - Add creator revenue share configuration

  2. Security
    - Maintain existing RLS policies
    - Add creator-specific access controls
*/

-- Update event_collaborators role check to include creator
ALTER TABLE event_collaborators
  DROP CONSTRAINT IF EXISTS event_collaborators_role_check,
  ADD CONSTRAINT event_collaborators_role_check 
    CHECK (role IN ('dj', 'promoter', 'creator'));

-- Add creator revenue share configuration
CREATE TABLE IF NOT EXISTS creator_revenue_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES users(id),
  share_percentage numeric NOT NULL CHECK (share_percentage BETWEEN 0 AND 100),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE creator_revenue_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for creator revenue shares
CREATE POLICY "Event owners can manage revenue shares"
  ON creator_revenue_shares
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = creator_revenue_shares.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can view their revenue shares"
  ON creator_revenue_shares
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = creator_revenue_shares.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Add creator-specific notification templates
INSERT INTO email_templates (name, subject, html_content) VALUES
(
  'creator_collaboration_invite',
  'Creative Collaboration Opportunity: {{event_name}}',
  '<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Creative Collaboration Opportunity</title>
      <style>
        .invite {
          background: linear-gradient(45deg, #6B46C1, #D53F8C);
          border-radius: 16px;
          padding: 24px;
          color: white;
        }
        .details {
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 24px; background: #0A0A0A; color: white; font-family: sans-serif;">
      <div class="invite">
        <h1>Creative Collaboration Opportunity</h1>
        <div class="details">
          <p><strong>Event:</strong> {{event_name}}</p>
          <p><strong>Date:</strong> {{event_date}}</p>
          <p><strong>Venue:</strong> {{venue}}</p>
          <p><strong>Revenue Share:</strong> {{revenue_share}}%</p>
        </div>
        <p>{{inviter_name}} would like to collaborate with you on their upcoming event.</p>
        <p>Log in to your dashboard to review and respond to this invitation.</p>
      </div>
    </body>
  </html>'
);

-- Function to handle creator revenue share notifications
CREATE OR REPLACE FUNCTION notify_creator_revenue_share()
RETURNS trigger AS $$
BEGIN
  -- Create notification for creator
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  )
  SELECT
    NEW.creator_id,
    'revenue_share_update',
    'Revenue Share Updated',
    'Your revenue share for ' || events.name || ' has been set to ' || NEW.share_percentage || '%',
    jsonb_build_object(
      'event_id', NEW.event_id,
      'event_name', events.name,
      'share_percentage', NEW.share_percentage
    )
  FROM events
  WHERE events.id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for revenue share notifications
CREATE TRIGGER on_revenue_share_change
  AFTER INSERT OR UPDATE ON creator_revenue_shares
  FOR EACH ROW
  EXECUTE FUNCTION notify_creator_revenue_share();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creator_revenue_shares_event_id ON creator_revenue_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_creator_revenue_shares_creator_id ON creator_revenue_shares(creator_id);