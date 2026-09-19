import { setAccessToken } from './token';
import { authJson, refreshAccessToken } from './authFetch';

export async function signup(data) {
  const result = await authJson(
    '/api/auth/signup',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    false
  );
  setAccessToken(result.accessToken);
  return result;
}

export async function login(data) {
  const result = await authJson(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    false
  );
  setAccessToken(result.accessToken);
  return result;
}

export async function logout() {
  await authJson('/api/auth/logout', { method: 'POST' }).catch(() => {});
  setAccessToken(null);
}

export async function refresh() {
  return refreshAccessToken();
}

export async function getMe() {
  return authJson('/api/auth/me');
}

export async function verifyEmail(token) {
  return authJson(
    '/api/auth/verify-email',
    {
      method: 'POST',
      body: JSON.stringify({ token }),
    },
    false
  );
}

export async function forgotPassword(email) {
  return authJson(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
    false
  );
}

export async function resetPassword(data) {
  return authJson(
    '/api/auth/reset-password',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    false
  );
}
