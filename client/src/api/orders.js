import { authJson as request } from './authFetch';

export async function createOrder(data) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyOrders() {
  return request('/api/orders/mine');
}

export async function getOrder(id) {
  return request(`/api/orders/${id}`);
}

export async function getAllOrders({ status, page, search, sort } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page) params.set('page', String(page));
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  const qs = params.toString();
  return request(`/api/orders${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(orderId, status) {
  return request(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
