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

export function getCoupons() {
  return request('/api/coupons');
}

export function validateCoupon(data) {
  return request('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function createCoupon(data) {
  return request('/api/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCoupon(id, data) {
  return request(`/api/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteCoupon(id) {
  return request(`/api/coupons/${id}`, {
    method: 'DELETE',
  });
}
