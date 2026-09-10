import { BrevoClient } from '@getbrevo/brevo';
import { wrap, heading, sectionLabel, detailRow, itemsTable, orderTotal, button, spacer, divider, step, contactButtons } from './template.js';

export async function sendOrderConfirmationEmail({ order, customerEmail, customerName }) {
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Order confirmation to ${customerEmail} for order #${order._id}`);
    return;
  }

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const orderUrl = `${clientUrl}/order-confirmation/${order._id}`;

  const rawNumbers = process.env.WHATSAPP_NUMBER || '00000000000';
  const whatsappNumber = rawNumbers.split(',')[0].trim();
  const waMessage = encodeURIComponent(`Hi, I placed order #${String(order._id).slice(-8).toUpperCase()} on Integration. Total: ৳${(order.totalAmount / 100).toLocaleString()}. Looking forward to hearing from you.`);
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  const messengerPage = process.env.MESSENGER_PAGE || 'placeholder';
  const messengerLink = `https://m.me/${messengerPage}`;

  const content = `
    ${heading('Order Confirmed', `Thank you, ${customerName}!`)}

    ${sectionLabel('Order Summary')}
    ${detailRow('Order ID', `#${String(order._id).slice(-8).toUpperCase()}`)}
    ${detailRow('Date', new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}

    ${spacer(4)}
    ${itemsTable(order.items, true)}
    ${orderTotal(order.totalAmount)}

    ${spacer(8)}
    <div style="text-align:center;">
      ${button('View Order', orderUrl)}
    </div>

    ${divider()}

    ${sectionLabel('What Happens Next')}
    ${step(1, "We'll contact you shortly to confirm your order details.")}
    ${step(2, 'Send your payment via <strong>bKash</strong> to the number we provide.')}
    ${step(3, 'Once payment is confirmed, your order ships within 2-3 business days.')}

    ${divider()}

    ${sectionLabel('Need Help?')}
    <p style="margin:0 0 12px;font-size:13px;color:#666666;">Reach out anytime — we're happy to help.</p>
    ${contactButtons(waLink, messengerLink, `mailto:noreply@integration.com`)}
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `Order Confirmed — #${String(order._id).slice(-8).toUpperCase()}`,
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: [{ email: customerEmail }],
    htmlContent: wrap(content),
  });
}
