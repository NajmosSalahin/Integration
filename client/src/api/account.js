import { authJson as request, authenticatedFetch } from './authFetch';

export async function updateMe(payload) {
  return request('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);

  const res = await authenticatedFetch('/api/auth/avatar', {
    method: 'POST',
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

export async function changePassword(payload) {
  return request('/api/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function toggleWishlist(productId) {
  return request('/api/auth/wishlist', {
    method: 'PATCH',
    body: JSON.stringify({ productId }),
  });
}

export async function createAddress(payload) {
  return request('/api/auth/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAddress(addressId, payload) {
  return request(`/api/auth/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAddress(addressId) {
  return request(`/api/auth/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultAddress(addressId) {
  return request(`/api/auth/addresses/${addressId}/default`, {
    method: 'PATCH',
  });
}