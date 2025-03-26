-- Add booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  professional_id uuid REFERENCES users(id),
  event_date date NOT NULL,
  budget_range text NOT NULL,
  message text NOT NULL,
  status booking_status DEFAULT 'pending',
  total_amount numeric,
  service_fee numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = professional_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Insert email templates
INSERT INTO email_templates (name, subject, html_content) VALUES
(
  'booking_request',
  'New Booking Request: {{event_date}}',
  '<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking Request</title>
      <style>
        .booking {
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
      <div class="booking">
        <h1>New Booking Request</h1>
        <div class="details">
          <p><strong>Date:</strong> {{event_date}}</p>
          <p><strong>Budget Range:</strong> {{budget_range}}</p>
          <p><strong>From:</strong> {{user_name}}</p>
          <p><strong>Message:</strong></p>
          <p>{{message}}</p>
        </div>
        <p>Log in to your dashboard to respond to this request.</p>
      </div>
    </body>
  </html>'
),
(
  'booking_confirmation',
  'Booking Confirmed: {{event_date}}',
  '<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmed</title>
      <style>
        .booking {
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
      <div class="booking">
        <h1>Booking Confirmed!</h1>
        <div class="details">
          <p><strong>Date:</strong> {{event_date}}</p>
          <p><strong>Professional:</strong> {{professional_name}}</p>
          <p><strong>Total Amount:</strong> {{total_amount}}</p>
          <p><strong>Service Fee:</strong> {{service_fee}}</p>
        </div>
        <p>Please complete the payment to finalize your booking.</p>
      </div>
    </body>
  </html>'
);

-- Function to handle booking notifications
CREATE OR REPLACE FUNCTION notify_booking()
RETURNS trigger AS $$
BEGIN
  -- Create notification for professional
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    NEW.professional_id,
    'booking_request',
    'New Booking Request',
    'You have a new booking request for ' || NEW.event_date
  );

  -- Create notification for user when booking is confirmed
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking for ' || NEW.event_date || ' has been confirmed'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking notifications
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking();