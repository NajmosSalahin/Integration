const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const LOGO_URL = `${CLIENT_URL}/logo.png`;

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

const colors = {
  bg: '#f4f5f7',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#666666',
  accent: '#3b82f6',
  border: '#e5e7eb',
  tableHeader: '#f8f9fa',
  tableAlt: '#fafbfc',
  success: '#22c55e',
  darkBg: '#111111',
};

export function wrap(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:${colors.bg};font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          ${header()}
          <tr>
            <td style="background:${colors.card};border:1px solid ${colors.border};border-top:none;border-radius:0 0 8px 8px;padding:32px;">
              ${content}
            </td>
          </tr>
          ${footer()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function header() {
  return `
  <tr>
    <td style="background:${colors.card};border:1px solid ${colors.border};border-bottom:none;border-radius:8px 8px 0 0;padding:24px 32px;text-align:center;">
      <img src="${LOGO_URL}" alt="Integration" width="40" height="40" style="display:inline-block;vertical-align:middle;margin-right:10px;border-radius:6px;">
      <span style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${colors.text};vertical-align:middle;">INTEGRATION</span>
      <p style="margin:8px 0 0;font-size:12px;color:${colors.textSecondary};letter-spacing:0.08em;">Different Styles, One Identity</p>
    </td>
  </tr>`;
}

function footer() {
  return `
  <tr>
    <td style="padding:20px 0;text-align:center;">
      <p style="margin:0;font-size:11px;color:${colors.textSecondary};">&copy; ${new Date().getFullYear()} Integration. All rights reserved.</p>
      <p style="margin:4px 0 0;font-size:11px;color:${colors.textSecondary};">Different Styles, One Identity.</p>
    </td>
  </tr>`;
}

export function heading(text, subtitle) {
  let h = `<h1 style="margin:0 0 4px;font-family:${FONT};font-size:20px;font-weight:700;color:${colors.text};">${text}</h1>`;
  if (subtitle) h += `<p style="margin:0;font-size:14px;color:${colors.accent};">${subtitle}</p>`;
  return h;
}

export function sectionLabel(text) {
  return `<p style="margin:24px 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${colors.textSecondary};">${text}</p>`;
}

export function detailRow(label, value) {
  return `<p style="margin:2px 0;font-size:14px;color:${colors.text};"><span style="color:${colors.textSecondary};">${label}:</span> ${value}</p>`;
}

export function button(text, href, color = colors.accent) {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-family:${FONT};font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">${text}</a>`;
}

export function spacer(px = 16) {
  return `<div style="height:${px}px;"></div>`;
}

export function divider() {
  return `<hr style="border:none;border-top:1px solid ${colors.border};margin:20px 0;">`;
}

export function messageBox(content, borderColor = colors.accent) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;"><tr><td style="background:${colors.tableHeader};border-left:3px solid ${borderColor};padding:14px 16px;border-radius:0 6px 6px 0;font-size:14px;color:${colors.text};line-height:1.6;">${content}</td></tr></table>`;
}

export function itemsTable(items, showPriceEach = true) {
  const rows = items.map((item, i) => {
    const bg = i % 2 === 0 ? colors.card : colors.tableAlt;
    const priceEach = showPriceEach ? `<td style="padding:10px 12px;border-bottom:1px solid ${colors.border};font-size:13px;color:${colors.text};text-align:right;">৳${((item.priceAtOrder / 100).toLocaleString())}</td>` : '';
    return `<tr style="background:${bg};">
      <td style="padding:10px 12px;border-bottom:1px solid ${colors.border};font-size:13px;color:${colors.text};">${item.title}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${colors.border};font-size:13px;color:${colors.textSecondary};">${item.size}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${colors.border};font-size:13px;color:${colors.text};text-align:center;">${item.quantity}</td>
      ${priceEach}
    </tr>`;
  }).join('');

  const priceHeader = showPriceEach ? `<th style="padding:8px 12px;border-bottom:2px solid ${colors.border};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${colors.textSecondary};text-align:right;">Price</th>` : '';
  const totalHeader = `<th style="padding:8px 12px;border-bottom:2px solid ${colors.border};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${colors.textSecondary};text-align:right;">Total</th>`;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;border:1px solid ${colors.border};border-radius:6px;overflow:hidden;border-collapse:collapse;">
    <thead>
      <tr style="background:${colors.tableHeader};">
        <th style="padding:8px 12px;border-bottom:2px solid ${colors.border};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${colors.textSecondary};text-align:left;">Item</th>
        <th style="padding:8px 12px;border-bottom:2px solid ${colors.border};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${colors.textSecondary};text-align:left;">Size</th>
        <th style="padding:8px 12px;border-bottom:2px solid ${colors.border};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${colors.textSecondary};text-align:center;">Qty</th>
        ${priceHeader}
        ${totalHeader}
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function orderTotal(totalAmount) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:12px;border-top:2px solid ${colors.border};text-align:right;">
        <span style="font-size:13px;color:${colors.textSecondary};text-transform:uppercase;letter-spacing:0.06em;">Total</span>
        <span style="margin-left:12px;font-size:20px;font-weight:700;color:${colors.accent};">৳${(totalAmount / 100).toLocaleString()}</span>
      </td>
    </tr>
  </table>`;
}

export function step(num, text) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">
    <tr>
      <td style="width:36px;vertical-align:top;">
        <div style="width:28px;height:28px;line-height:28px;text-align:center;background:${colors.accent};color:#ffffff;border-radius:50%;font-size:13px;font-weight:700;">${num}</div>
      </td>
      <td style="padding:4px 0 0;font-size:14px;color:${colors.text};line-height:1.5;">${text}</td>
    </tr>
  </table>`;
}

export function contactButtons(waLink, messengerLink, emailLink) {
  let btns = '';
  if (waLink) btns += button('WhatsApp', waLink, colors.success) + ' ';
  if (messengerLink) btns += button('Messenger', messengerLink, '#0084ff') + ' ';
  if (emailLink) btns += button('Email', emailLink, '#555555');
  return `<div style="margin:16px 0;">${btns}</div>`;
}
