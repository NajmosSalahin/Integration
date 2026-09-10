import { BrevoClient } from '@getbrevo/brevo';
import { wrap, heading, sectionLabel, messageBox, divider } from './template.js';

export async function sendContactEmail({ name, email, message }) {
  const rawEmails = process.env.OWNER_EMAIL;
  const ownerEmails = rawEmails
    ? rawEmails.split(',').map((e) => e.trim()).filter(Boolean)
    : [];

  if (ownerEmails.length === 0 || (ownerEmails.length === 1 && ownerEmails[0] === 'your-email@example.com')) {
    console.log(`[DEV] Contact form submission`);
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Message: ${message}`);
    return;
  }

  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Would send contact email to ${ownerEmails.join(', ')} from ${name}`);
    return;
  }

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const content = `
    ${heading('New Contact Submission')}

    ${sectionLabel('From')}
    <p style="margin:2px 0;font-size:14px;color:#1a1a1a;"><strong>${name}</strong></p>
    <p style="margin:2px 0;font-size:14px;"><a href="mailto:${email}" style="color:#3b82f6;text-decoration:none;">${email}</a></p>

    ${divider()}

    ${sectionLabel('Message')}
    ${messageBox(message.replace(/\n/g, '<br>'))}
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `Contact Form — ${name}`,
    sender: { name: 'Integration Website', email: 'najmussalahin.adib@gmail.com' },
    to: ownerEmails.map((email) => ({ email })),
    replyTo: { email, name },
    htmlContent: wrap(content),
  });
}
