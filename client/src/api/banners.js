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

export async function fetchBanners() {
  const res = await fetch('/api/banners');
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
}

export function getAdminBanners() {
  return request('/api/banners/admin/all');
}

export function createBanner(data) {
  return request('/api/banners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBanner(id, data) {
  return request(`/api/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteBanner(id) {
  return request(`/api/banners/${id}`, {
    method: 'DELETE',
  });
}