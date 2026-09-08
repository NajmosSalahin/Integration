import { BrevoClient } from '@getbrevo/brevo';

export async function sendContactEmail({ name, email, message }) {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail || ownerEmail === 'your-email@example.com') {
    console.log(`[DEV] Contact form submission`);
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Message: ${message}`);
    return;
  }

  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Would send contact email to ${ownerEmail} from ${name}`);
    return;
  }

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `Contact Form — ${name}`,
    sender: { name: 'Integration Website', email: 'noreply@integration.com' },
    to: [{ email: ownerEmail }],
    replyTo: { email, name },
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e8e8e8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
          .field { margin: 12px 0; }
          .label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; }
          .value { font-size: 14px; margin-top: 4px; }
          .message { background: #111; padding: 16px; border-left: 3px solid #3b82f6; white-space: pre-wrap; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>INTEGRATION</h1>
          <p style="color:#3b82f6">New contact form submission</p>

          <div class="field">
            <div class="label">Name</div>
            <div class="value">${name}</div>
          </div>

          <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${email}" style="color:#3b82f6">${email}</a></div>
          </div>

          <div class="field">
            <div class="label">Message</div>
            <div class="message">${message.replace(/\n/g, '<br>')}</div>
          </div>

          <div class="footer">
            <p>Different Styles, One Identity.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
