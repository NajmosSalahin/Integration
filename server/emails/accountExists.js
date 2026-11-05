import { BrevoClient } from '@getbrevo/brevo';
import { wrap, heading, button, spacer } from './template.js';

export async function sendAccountExistsEmail(email) {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    const domain = email.split('@')[1] || 'unknown';
    console.log(`[DEV] Account already exists email queued for recipient domain ${domain}`);
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const loginUrl = `${clientUrl}/login`;

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const content = `
    ${heading('You Already Have an Account')}

    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">
      Someone tried to create an Integration account with this email address. If that was you, log in to continue.
    </p>

    ${spacer(8)}
    <div style="text-align:center;">
      ${button('Log In', loginUrl)}
    </div>

    ${spacer(8)}
    <p style="margin:0;font-size:13px;color:#666666;line-height:1.5;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Your Integration account already exists',
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: [{ email }],
    htmlContent: wrap(content),
  });
}
