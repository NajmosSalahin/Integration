import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NOTO_FONT = join(__dirname, '..', 'fonts', 'NotoSans-Regular.ttf');
const LOGO_PATH = join(__dirname, '..', '..', '..', 'client', 'public', 'logo.png');

const C = {
  bg: '#0a0a0a',
  card: '#141414',
  cardAlt: '#1a1a1a',
  accent: '#3b82f6',
  text: '#e8e8e8',
  textSecondary: '#888888',
  muted: '#555555',
  border: '#222222',
};

export function generateOrderPdf({ order, customerName, customerEmail }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.registerFont('Noto', NOTO_FONT);
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const margin = 50;
    const contentW = pageW - margin * 2;

    doc.rect(0, 0, pageW, doc.page.height).fill(C.bg);

    let y = margin;

    try {
      const logoData = readFileSync(LOGO_PATH);
      doc.image(logoData, margin, y, { width: 36, height: 36 });
    } catch {}

    doc.font('Helvetica-Bold').fontSize(16).fillColor(C.text);
    doc.text('INTEGRATION', margin + 44, y + 6);
    doc.font('Helvetica').fontSize(8).fillColor(C.textSecondary);
    doc.text('Different Styles, One Identity', margin + 44, y + 26);
    y += 50;

    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(C.accent).lineWidth(1.5).stroke();
    y += 20;

    doc.font('Helvetica-Bold').fontSize(14).fillColor(C.text);
    doc.text('ORDER RECEIPT', margin, y);
    y += 24;

    const cardX = margin;
    const cardW = contentW;
    const cardPad = 14;

    doc.roundedRect(cardX, y, cardW, 72, 6).fill(C.card);
    let cy = y + cardPad;

    doc.font('Helvetica').fontSize(9).fillColor(C.textSecondary);
    doc.text('ORDER ID', cardX + cardPad, cy);
    doc.text('DATE', cardX + cardPad + 140, cy);
    doc.text('STATUS', cardX + cardPad + 300, cy);
    doc.text('PAYMENT', cardX + cardPad + 400, cy);
    cy += 14;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.text);
    doc.text(`#${String(order._id).slice(-8).toUpperCase()}`, cardX + cardPad, cy);
    doc.text(new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), cardX + cardPad + 140, cy);
    doc.font('Noto').text(order.status.replace(/_/g, ' ').toUpperCase(), cardX + cardPad + 300, cy);
    doc.font('Helvetica').text(order.paymentMethod.toUpperCase(), cardX + cardPad + 400, cy);
    y += 88;

    doc.roundedRect(cardX, y, cardW, 80, 6).fill(C.card);
    cy = y + cardPad;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.text);
    doc.text('CUSTOMER', cardX + cardPad, cy);
    cy += 16;

    doc.font('Helvetica').fontSize(9).fillColor(C.textSecondary);
    doc.text('Name', cardX + cardPad, cy);
    doc.text('Email', cardX + cardPad + 140, cy);
    doc.text('Phone', cardX + cardPad + 300, cy);
    cy += 12;

    doc.font('Helvetica').fontSize(10).fillColor(C.text);
    doc.text(customerName, cardX + cardPad, cy, { width: 120 });
    doc.text(customerEmail, cardX + cardPad + 140, cy, { width: 140 });
    doc.text(order.contactPhone, cardX + cardPad + 300, cy, { width: 120 });
    cy += 16;

    doc.font('Helvetica').fontSize(9).fillColor(C.textSecondary);
    doc.text('Address', cardX + cardPad, cy);
    cy += 12;
    doc.font('Helvetica').fontSize(10).fillColor(C.text);
    doc.text(order.deliveryAddress, cardX + cardPad, cy, { width: cardW - cardPad * 2 });
    y += 96;

    y += 12;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.text);
    doc.text('ITEMS', margin, y);
    y += 18;

    const colX = {
      title: margin,
      size: margin + 230,
      qty: margin + 310,
      total: margin + 380,
    };
    const colW = { title: 220, size: 70, qty: 60, total: 100 };

    doc.rect(margin, y, contentW, 22).fill(C.card);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.textSecondary);
    doc.text('ITEM', colX.title + 8, y + 7, { width: colW.title });
    doc.text('SIZE', colX.size, y + 7, { width: colW.size });
    doc.text('QTY', colX.qty, y + 7, { width: colW.qty, align: 'center' });
    doc.text('TOTAL', colX.total, y + 7, { width: colW.total, align: 'right' });
    y += 22;

    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(C.border).lineWidth(0.5).stroke();
    y += 2;

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const rowBg = i % 2 === 0 ? C.card : C.cardAlt;
      const lineTotal = item.priceAtOrder * item.quantity;

      doc.rect(margin, y, contentW, 24).fill(rowBg);

      doc.font('Helvetica').fontSize(10).fillColor(C.text);
      doc.text(item.title, colX.title + 8, y + 6, { width: colW.title });
      doc.fillColor(C.textSecondary);
      doc.text(item.size, colX.size, y + 6, { width: colW.size });
      doc.fillColor(C.text);
      doc.text(String(item.quantity), colX.qty, y + 6, { width: colW.qty, align: 'center' });
      doc.font('Noto').text(`৳${(lineTotal / 100).toLocaleString()}`, colX.total, y + 6, { width: colW.total, align: 'right' });

      y += 24;
    }

    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(C.border).lineWidth(0.5).stroke();
    y += 4;

    doc.rect(margin, y, contentW, 30).fill(C.accent);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff');
    doc.text('TOTAL', colX.qty, y + 9, { width: colW.qty + (colX.total - colX.qty), align: 'right' });
    doc.font('Noto').text(`৳${(order.totalAmount / 100).toLocaleString()}`, colX.total - 10, y + 8, { width: colW.total + 10, align: 'right' });
    y += 44;

    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor(C.accent).lineWidth(1).stroke();
    y += 16;

    doc.font('Helvetica').fontSize(9).fillColor(C.textSecondary);
    doc.text('Payment is manual via bKash. You will be contacted to arrange payment.', margin, y);
    y += 20;
    doc.font('Helvetica').fontSize(8).fillColor(C.muted);
    doc.text('Generated by Integration — Different Styles, One Identity.', margin, y, { align: 'center', width: contentW });

    doc.end();
  });
}
