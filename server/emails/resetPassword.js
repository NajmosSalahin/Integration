import { BrevoClient } from '@getbrevo/brevo';
import { wrap, heading, button, spacer, divider } from './template.js';

export async function sendResetPasswordEmail(email, token) {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Reset password email to ${email}: token=${token}`);
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const content = `
    ${heading('Reset Your Password')}

    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">
      You requested a password reset. Click the button below to set a new password for your Integration account.
    </p>

    ${spacer(8)}
    <div style="text-align:center;">
      ${button('Reset Password', resetUrl)}
    </div>

    ${spacer(8)}
    <p style="margin:0;font-size:13px;color:#666666;line-height:1.5;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will remain unchanged.
    </p>
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Reset your Integration password',
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: [{ email }],
    htmlContent: wrap(content),
  });
}
