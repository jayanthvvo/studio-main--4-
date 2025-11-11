import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// This is the "from" address. 
// NOTE: For production, this MUST be a verified domain in Resend.
// For testing, Resend allows 'onboarding@resend.dev'.
const FROM_EMAIL = 'ThesisFlow <onboarding@resend.dev>';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends an email using Resend.
 */
export async function sendEmail(payload: EmailPayload) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    console.log('Email sent successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't re-throw the error, just log it. 
    // We don't want email failures to break the main API request.
  }
}
