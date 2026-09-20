import { authJson as request } from './authFetch';

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
