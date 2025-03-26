-- Verify and update email templates
DO $$
BEGIN
  -- Email Templates
  INSERT INTO email_templates (name, subject, html_content)
  VALUES
    ('confirmation',
     'Confirm your email',
     '<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirm your email</title>
          <style>
            .button { background: linear-gradient(45deg, #6B46C1, #D53F8C); padding: 12px 24px; color: white; text-decoration: none; border-radius: 24px; }
          </style>
        </head>
        <body style="margin: 0; padding: 24px; background: #0A0A0A; color: white; font-family: sans-serif;">
          <h2>Welcome to Real L!VE</h2>
          <p>Please confirm your email address to get started:</p>
          <p><a href="{{ .ConfirmationURL }}" class="button">Confirm Email</a></p>
        </body>
      </html>'
    ),
    ('recovery',
     'Reset your password',
     '<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset your password</title>
          <style>
            .button { background: linear-gradient(45deg, #6B46C1, #D53F8C); padding: 12px 24px; color: white; text-decoration: none; border-radius: 24px; }
          </style>
        </head>
        <body style="margin: 0; padding: 24px; background: #0A0A0A; color: white; font-family: sans-serif;">
          <h2>Password Reset</h2>
          <p>Click the button below to reset your password:</p>
          <p><a href="{{ .ConfirmationURL }}" class="button">Reset Password</a></p>
        </body>
      </html>'
    ),
    ('magic_link',
     'Your login link',
     '<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Login Link</title>
          <style>
            .button { background: linear-gradient(45deg, #6B46C1, #D53F8C); padding: 12px 24px; color: white; text-decoration: none; border-radius: 24px; }
          </style>
        </head>
        <body style="margin: 0; padding: 24px; background: #0A0A0A; color: white; font-family: sans-serif;">
          <h2>Login Link</h2>
          <p>Click the button below to log in:</p>
          <p><a href="{{ .ConfirmationURL }}" class="button">Log In</a></p>
        </body>
      </html>'
    )
  ON CONFLICT (name) DO UPDATE
  SET
    subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content;

END $$;

-- Add helpful comment
COMMENT ON TABLE email_templates IS 
'Email templates for auth flows and notifications.
Templates include:
- confirmation: Email confirmation
- recovery: Password reset
- magic_link: Magic link login
- ticket_confirmation: Ticket purchase confirmation
- booking_request: Booking request notification
- booking_confirmation: Booking confirmation
- creator_collaboration_invite: Creative collaboration invitation';