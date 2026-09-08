import { BrevoClient } from '@getbrevo/brevo';

export async function subscribeNewsletter(req, res) {
  try {
    const { email } = req.body;
    const listId = process.env.BREVO_NEWSLETTER_LIST_ID;

    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key' || !listId || listId === 'your-list-id') {
      console.log(`[DEV] Newsletter signup: ${email}`);
      return res.json({ message: 'Subscribed successfully' });
    }

    const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

    try {
      await brevo.contactsApi.createContact({
        email,
        listIds: [parseInt(listId)],
      });
    } catch (err) {
      if (err.status === 400 && err.body?.message?.includes('already exists')) {
        return res.json({ message: 'Already subscribed' });
      }
      throw err;
    }

    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('subscribeNewsletter error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
}
