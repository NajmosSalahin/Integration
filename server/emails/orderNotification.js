import { BrevoClient } from '@getbrevo/brevo';

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

  const itemList = order.items
    .map((i) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #222">${i.title}</td><td style="padding:6px 12px;border-bottom:1px solid #222">${i.size}</td><td style="padding:6px 12px;border-bottom:1px solid #222;text-align:center">${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #222;text-align:right">৳${((i.priceAtOrder * i.quantity) / 100).toLocaleString()}</td></tr>`)
    .join('');

  const rawNumbers = process.env.WHATSAPP_NUMBER || '00000000000';
  const whatsappNumber = rawNumbers.split(',')[0].trim();
  const waMessage = encodeURIComponent(`New order #${order._id} from ${customerName}. Total: ৳${(order.totalAmount / 100).toLocaleString()}. Phone: ${order.contactPhone}. Address: ${order.deliveryAddress}`);
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `New Order — #${String(order._id).slice(-8).toUpperCase()}`,
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: ownerEmails.map((email) => ({ email })),
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e8e8e8; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
          .section { margin: 20px 0; }
          .section-title { font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 6px 12px; border-bottom: 2px solid #333; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; }
          .total-row { font-weight: bold; font-size: 14px; color: #3b82f6; }
          .detail { font-size: 14px; line-height: 1.8; }
          .btn { display: inline-block; padding: 12px 24px; background: #25d366; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; margin-top: 12px; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>INTEGRATION</h1>
          <p style="color:#3b82f6;font-size:16px">New order received!</p>

          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="detail">
              <p>Order ID: #${String(order._id).slice(-8).toUpperCase()}</p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer</div>
            <div class="detail">
              <p>Name: ${customerName}</p>
              <p>Email: ${customerEmail}</p>
              <p>Phone: ${order.contactPhone}</p>
              <p>Address: ${order.deliveryAddress}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Items</div>
            <table>
              <thead>
                <tr><th>Item</th><th>Size</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th></tr>
              </thead>
              <tbody>
                ${itemList}
              </tbody>
              <tfoot>
                <tr><td colspan="3" style="padding:12px;text-align:right;font-weight:bold">Total</td><td style="padding:12px;text-align:right;font-weight:bold;color:#3b82f6;font-size:16px">৳${(order.totalAmount / 100).toLocaleString()}</td></tr>
              </tfoot>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Quick Actions</div>
            <a href="${waLink}" class="btn">Contact on WhatsApp</a>
          </div>

          <div class="footer">
            <p>PDF receipt attached to this email.</p>
            <p>Different Styles, One Identity.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachment: pdfBuffer
      ? [{ content: pdfBuffer.toString('base64'), name: `order-${String(order._id).slice(-8).toUpperCase()}.pdf` }]
      : [],
  });
}
