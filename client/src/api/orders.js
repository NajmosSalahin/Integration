import { getAccessToken } from './token';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(getAccessToken() && { Authorization: `Bearer ${getAccessToken()}` }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

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

export async function getAllOrders({ status, page } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page) params.set('page', String(page));
  const qs = params.toString();
  return request(`/api/orders${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(orderId, status) {
  return request(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
