import { BrevoClient } from '@getbrevo/brevo';

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

  const itemList = order.items
    .map((i) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #222">${i.title}</td><td style="padding:6px 12px;border-bottom:1px solid #222">${i.size}</td><td style="padding:6px 12px;border-bottom:1px solid #222;text-align:center">${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #222;text-align:right">৳${((i.priceAtOrder * i.quantity) / 100).toLocaleString()}</td></tr>`)
    .join('');

  await brevo.transactionalEmails.sendTransacEmail({
    subject: `Order Confirmed — #${String(order._id).slice(-8).toUpperCase()}`,
    sender: { name: 'Integration', email: 'najmussalahin.adib@gmail.com' },
    to: [{ email: customerEmail }],
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e8e8e8; padding: 40px; }
          .container { max-width: 500px; margin: 0 auto; }
          h1 { font-size: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
          .section { margin: 20px 0; }
          .section-title { font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 6px 12px; border-bottom: 2px solid #333; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; }
          .step { margin: 12px 0; padding: 12px; background: #111; border-left: 3px solid #3b82f6; }
          .step-num { color: #3b82f6; font-weight: bold; }
          .contact-btn { display: inline-block; padding: 10px 20px; margin: 6px 8px 6px 0; text-decoration: none; border-radius: 4px; font-size: 13px; color: white; }
          .btn-wa { background: #25d366; }
          .btn-messenger { background: #0084ff; }
          .btn-email { background: #555; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>INTEGRATION</h1>
          <p style="color:#3b82f6;font-size:16px">Thank you for your order!</p>

          <div class="section">
            <div class="section-title">Order Summary</div>
            <p>Order ID: #${String(order._id).slice(-8).toUpperCase()}</p>
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
            <div class="section-title">What Happens Next</div>
            <div class="step">
              <span class="step-num">1.</span> We'll contact you shortly to confirm your order details.
            </div>
            <div class="step">
              <span class="step-num">2.</span> Send your payment via <strong>bKash</strong> to the number we provide.
            </div>
            <div class="step">
              <span class="step-num">3.</span> Once payment is confirmed, your order ships within 2-3 business days.
            </div>
          </div>

          <div class="section">
            <div class="section-title">Contact Us</div>
            <p style="font-size:13px;color:#888;margin-bottom:12px">Reach out anytime — we're happy to help.</p>
            <a href="${waLink}" class="contact-btn btn-wa">WhatsApp</a>
            <a href="${messengerLink}" class="contact-btn btn-messenger">Messenger</a>
            <a href="mailto:noreply@integration.com" class="contact-btn btn-email">Email</a>
          </div>

          <div class="footer">
            <p>Different Styles, One Identity.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
