import { sendContactEmail } from '../emails/contactForm.js';

export async function submitContact(req, res) {
  try {
    const { name, email, message } = req.body;

    await sendContactEmail({ name, email, message });

    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('submitContact error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}
