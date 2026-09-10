import { getAccessToken, setAccessToken } from './token';

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

export async function signup(data) {
  const result = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAccessToken(result.accessToken);
  return result;
}

export async function login(data) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAccessToken(result.accessToken);
  return result;
}

export async function logout() {
  await request('/api/auth/logout', { method: 'POST' });
  setAccessToken(null);
}

export async function refresh() {
  const result = await request('/api/auth/refresh', { method: 'POST' });
  setAccessToken(result.accessToken);
  return result;
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function verifyEmail(token) {
  return request('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function forgotPassword(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
