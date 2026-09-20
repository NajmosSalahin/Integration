export const PAYMENT_METHOD_LABELS = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  cod: 'Cash on Delivery',
};

export function paymentMethodLabel(value) {
  return PAYMENT_METHOD_LABELS[value] || 'Manual';
}

export function isCod(value) {
  return value === 'cod';
}