export const siteConfig = {
  contact: {
    whatsappNumber: '01326976206',
    messengerPage: '61594204353841',
    email: 'najmussalahin.adib@gmail.com',
  },
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61594204353841',
    x: 'https://x.com/integration09',
    instagram: 'https://www.instagram.com/YOUR_HANDLE',
  },
};

export function buildWhatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}