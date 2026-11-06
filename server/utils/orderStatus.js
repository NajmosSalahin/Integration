export const ORDER_STATUSES = [
  'pending_payment',
  'awaiting_confirmation',
  'paid',
  'shipped',
  'fulfilled',
  'cancelled',
];

export const ORDER_STATUS_TRANSITIONS = {
  pending_payment: ['paid', 'cancelled'],
  awaiting_confirmation: ['paid', 'shipped', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['fulfilled'],
  fulfilled: [],
  cancelled: [],
};

export function canTransition(from, to) {
  return (ORDER_STATUS_TRANSITIONS[from] || []).includes(to);
}
