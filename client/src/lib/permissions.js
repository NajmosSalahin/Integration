export const ADMIN_SECTIONS = {
  orders: 'Orders',
  products: 'Products',
  coupons: 'Coupons',
  banners: 'Banners',
  categories: 'Categories',
};

export const ADMIN_SECTION_KEYS = Object.keys(ADMIN_SECTIONS);

export function hasAdminSection(user, section) {
  if (user?.role !== 'admin') return false;
  const perms = user.permissions || [];
  return perms.length === 0 || perms.includes(section);
}

export function getAdminSections(user) {
  if (user?.role !== 'admin') return [];
  const perms = user.permissions || [];
  if (perms.length === 0) return ADMIN_SECTION_KEYS;
  return ADMIN_SECTION_KEYS.filter((s) => perms.includes(s));
}