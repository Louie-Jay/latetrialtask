/*
  # Add email templates and functions

  1. New Tables
    - email_templates: Stores HTML email templates
    - email_logs: Tracks sent emails
  
  2. Functions
    - send_ticket_email: Sends ticket confirmation emails
*/

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  ticket_id uuid REFERENCES tickets(id),
  template_name text REFERENCES email_templates(name),
  sent_to text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- Insert ticket confirmation email template
INSERT INTO email_templates (name, subject, html_content) VALUES (
  'ticket_confirmation',
  'Your Ticket for {{event_name}}',
  '<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Ticket</title>
      <style>
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        .ticket {
          background: linear-gradient(45deg, #6B46C1, #D53F8C);
          border-radius: 16px;
          padding: 24px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .ticket::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255,255,255,0.2) 50%,
            transparent 100%
          );
          animation: shine 3s infinite;
        }
        .qr-code {
          background: white;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .event-details {
          margin: 16px 0;
          padding: 16px;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 24px; background: #0A0A0A; color: white; font-family: sans-serif;">
      <div class="ticket">
        <h1 style="margin: 0 0 16px 0;">{{event_name}}</h1>
        
        <div class="event-details">
          <p style="margin: 8px 0;">
            <strong>Date:</strong> {{event_date}}
          </p>
          <p style="margin: 8px 0;">
            <strong>Venue:</strong> {{venue}}
          </p>
          <p style="margin: 8px 0;">
            <strong>Ticket Type:</strong> {{ticket_type}}
          </p>
        </div>

        <div class="qr-code">
          <img src="{{qr_code_url}}" alt="Ticket QR Code" style="max-width: 100%; height: auto;">
        </div>

        <p style="margin: 16px 0 0 0; font-size: 14px; opacity: 0.8;">
          Present this QR code at the venue for entry
        </p>
      </div>
    </body>
  </html>'
);

-- Function to send ticket email
CREATE OR REPLACE FUNCTION send_ticket_email()
RETURNS trigger AS $$
BEGIN
  -- Get user email
  INSERT INTO email_logs (user_id, ticket_id, template_name, sent_to)
  SELECT
    NEW.user_id,
    NEW.id,
    'ticket_confirmation',
    users.email
  FROM users
  WHERE users.id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new tickets
CREATE OR REPLACE TRIGGER on_ticket_created
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION send_ticket_email();

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read email templates"
  ON email_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);