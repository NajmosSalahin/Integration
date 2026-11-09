export const siteConfig = {
  contact: {
    whatsappNumber: '01326976206',
    messengerPage: '61594204353841',
    email: 'najmussalahin.adib@gmail.com',
  },
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61594204353841',
    x: 'https://x.com/integration09',
  },
};

export function normalizeWhatsappNumber(number) {
  const digits = String(number).replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `880${digits.slice(1)}`;
  return digits;
}

export function buildWhatsappUrl(number, text) {
  return `https://wa.me/${normalizeWhatsappNumber(number)}?text=${encodeURIComponent(text)}`;
}
