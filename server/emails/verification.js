import { BrevoClient } from '@getbrevo/brevo';
import { wrap, heading, button, spacer, divider } from './template.js';

export async function sendVerificationEmail(email, token) {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Verification email to ${email}: token=${token}`);
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const content = `
    ${heading('Verify Your Email')}

    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">
      Thanks for creating an account on Integration. Click the button below to verify your email address and get started.
    </p>

    ${spacer(8)}
    <div style="text-align:center;">
      ${button('Verify Email', verifyUrl)}
    </div>

    ${spacer(8)}
    <p style="margin:0;font-size:13px;color:#666666;line-height:1.5;">
      If you didn't create this account, you can safely ignore this email.
    </p>
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Verify your Integration account',
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: [{ email }],
    htmlContent: wrap(content),
  });
}
