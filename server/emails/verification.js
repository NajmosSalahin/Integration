import { BrevoClient } from '@getbrevo/brevo';

export async function sendVerificationEmail(email, token) {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Verification email to ${email}: token=${token}`);
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Verify your Integration account',
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: [{ email }],
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e8e8e8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
          .btn { display: inline-block; padding: 12px 32px; background: #3b82f6; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>INTEGRATION</h1>
          <p>Thanks for creating an account. Click below to verify your email address.</p>
          <a href="${verifyUrl}" class="btn">Verify Email</a>
          <p>If you didn't create this account, you can ignore this email.</p>
          <div class="footer">
            <p>Different Styles, One Identity.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
