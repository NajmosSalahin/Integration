export function defaultAddress(user) {
  if (!user?.addresses?.length) return null;
  return user.addresses.find((a) => a.isDefault) || user.addresses[0];
}

export function composeAddress(addr) {
  if (!addr) return '';
  const parts = [addr.line1, addr.line2].filter(Boolean);
  const place = [addr.city, addr.region, addr.postal].filter(Boolean).join(', ');
  if (place) parts.push(place);
  if (addr.country) parts.push(addr.country);
  return parts.filter(Boolean).join(', ');
}