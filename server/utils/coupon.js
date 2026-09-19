export const COUPON_REASON_MESSAGES = {
  inactive: 'This coupon is no longer active.',
  expired: 'This coupon has expired.',
  'min-order': 'Your order subtotal is below this coupon\'s minimum.',
  'usage-exceeded': 'This coupon has reached its usage limit.',
  'per-user-exceeded': 'You have already used this coupon.',
};

export function computeDiscount({ coupon, subtotal }) {
  if (coupon.discountType === 'fixed') {
    return Math.min(coupon.value, subtotal);
  }
  const raw = Math.round((subtotal * coupon.value) / 100);
  const cap = coupon.maxDiscount > 0 ? coupon.maxDiscount : Infinity;
  return Math.min(raw, cap, subtotal);
}

export function couponIssue({ coupon, subtotal, userOrderCount }) {
  if (!coupon.active) return { reason: 'inactive' };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return { reason: 'expired' };
  if (subtotal < coupon.minOrderAmount) return { reason: 'min-order' };
  if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) return { reason: 'usage-exceeded' };
  if (coupon.perUserLimit > 0 && userOrderCount >= coupon.perUserLimit) return { reason: 'per-user-exceeded' };
  return null;
}