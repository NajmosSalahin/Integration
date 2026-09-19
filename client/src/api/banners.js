import { authJson as request } from './authFetch';

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