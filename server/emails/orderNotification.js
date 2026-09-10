import { BrevoClient } from '@getbrevo/brevo';
import { wrap, heading, sectionLabel, detailRow, itemsTable, orderTotal, button, spacer, divider } from './template.js';

export async function sendOrderNotificationEmail({ order, customerName, customerEmail, pdfBuffer }) {
  const rawEmails = process.env.OWNER_EMAIL;
  const ownerEmails = rawEmails
    ? rawEmails.split(',').map((e) => e.trim()).filter(Boolean)
    : [];

  if (ownerEmails.length === 0 || (ownerEmails.length === 1 && ownerEmails[0] === 'your-email@example.com')) {
    console.log(`[DEV] Order notification — Order #${order._id}`);
    console.log(`  Customer: ${customerName} (${customerEmail})`);
    console.log(`  Phone: ${order.contactPhone}`);
    console.log(`  Address: ${order.deliveryAddress}`);
    console.log(`  Items: ${order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}`);
    console.log(`  Total: ৳${(order.totalAmount / 100).toLocaleString()}`);
    console.log(`  PDF attached: ${pdfBuffer ? 'yes' : 'no'}`);
    return;
  }

  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'your-brevo-api-key') {
    console.log(`[DEV] Would send order notification to ${ownerEmails.join(', ')} for order #${order._id}`);
    return;
  }

  const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  const rawNumbers = process.env.WHATSAPP_NUMBER || '00000000000';
  const whatsappNumber = rawNumbers.split(',')[0].trim();
  const waMessage = encodeURIComponent(`New order #${String(order._id).slice(-8).toUpperCase()} from ${customerName}. Total: ৳${(order.totalAmount / 100).toLocaleString()}. Phone: ${order.contactPhone}. Address: ${order.deliveryAddress}`);
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  const content = `
    ${heading('New Order Received', `#${String(order._id).slice(-8).toUpperCase()}`)}

    ${sectionLabel('Order Details')}
    ${detailRow('Order ID', `#${String(order._id).slice(-8).toUpperCase()}`)}
    ${detailRow('Date', new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
    ${detailRow('Status', order.status.replace(/_/g, ' ').toUpperCase())}

    ${divider()}

    ${sectionLabel('Customer')}
    ${detailRow('Name', customerName)}
    ${detailRow('Email', customerEmail)}
    ${detailRow('Phone', order.contactPhone)}
    ${detailRow('Address', order.deliveryAddress)}

    ${divider()}

    ${sectionLabel('Items')}
    ${itemsTable(order.items, false)}
    ${orderTotal(order.totalAmount)}

    ${spacer(8)}
    <div style="text-align:center;">
      ${button('Contact on WhatsApp', waLink, '#22c55e')}
    </div>

    ${divider()}
    <p style="margin:0;font-size:12px;color:#666666;">PDF receipt attached to this email.</p>
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `New Order — #${String(order._id).slice(-8).toUpperCase()}`,
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: ownerEmails.map((email) => ({ email })),
    htmlContent: wrap(content),
    attachment: pdfBuffer
      ? [{ content: pdfBuffer.toString('base64'), name: `order-${String(order._id).slice(-8).toUpperCase()}.pdf` }]
      : [],
  });
}
