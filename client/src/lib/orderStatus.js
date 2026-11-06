export const ORDER_STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  awaiting_confirmation: 'Awaiting Confirmation',
  paid: 'Paid',
  shipped: 'Shipped',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_TRANSITIONS = {
  pending_payment: ['paid', 'cancelled'],
  awaiting_confirmation: ['paid', 'shipped', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['fulfilled'],
  fulfilled: [],
  cancelled: [],
};

export function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status;
}

export const ORDER_STATUS_BADGES = {
  pending_payment: { label: 'Processing', cls: 'bg-yellow-500/10 text-yellow-400' },
  awaiting_confirmation: { label: 'Processing', cls: 'bg-yellow-500/10 text-yellow-400' },
  paid: { label: 'Processing', cls: 'bg-yellow-500/10 text-yellow-400' },
  shipped: { label: 'Shipped', cls: 'bg-[var(--accent)]/10 text-[var(--accent)]' },
  fulfilled: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400' },
};

export function orderStatusBadge(status) {
  return ORDER_STATUS_BADGES[status] || { label: status, cls: 'text-[var(--text-secondary)]' };
}