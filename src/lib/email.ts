import { supabase } from './supabase';

type EmailData = {
  to: string;
  templateName: string;
  variables: Record<string, string>;
};

export async function sendEmail({ to, templateName, variables }: EmailData): Promise<boolean> {
  try {
    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_content')
      .eq('name', templateName)
      .single();

    if (templateError) throw templateError;

    // Replace variables in subject and content
    let subject = template.subject;
    let htmlContent = template.html_content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      htmlContent = htmlContent.replace(regex, value);
    });

    // Log email for development/testing
    if (process.env.NODE_ENV === 'development') {
      console.log('Email would be sent:', {
        to,
        subject,
        htmlContent
      });
      return true;
    }

    // In production, the email will be sent via Supabase Edge Functions
    // which will handle the actual email delivery through SendGrid/AWS SES
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, htmlContent }
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}