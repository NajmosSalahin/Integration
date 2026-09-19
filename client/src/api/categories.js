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

export async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export function getAdminCategories() {
  return request('/api/categories/admin/all');
}

export function createCategory(data) {
  return request('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCategory(id, data) {
  return request(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id) {
  return request(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}