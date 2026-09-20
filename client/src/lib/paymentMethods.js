export const PAYMENT_METHODS = [
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'cod', label: 'Cash on Delivery' },
];

export function paymentLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || 'Manual';
}