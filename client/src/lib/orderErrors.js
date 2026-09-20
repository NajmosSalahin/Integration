export function orderErrorMessage(error) {
  const message = String(error?.message || '');
  if (/not authorized/i.test(message)) return 'This order belongs to another account.';
  if (/not found/i.test(message)) return 'Order not found.';
  if (/database not connected/i.test(message)) return 'Our servers are having trouble right now. Please try again shortly.';
  if (message && message !== 'Request failed') return message;
  return 'Something went wrong loading this order.';
}