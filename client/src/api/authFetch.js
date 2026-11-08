import { getAccessToken, setAccessToken } from './token';

let refreshPromise = null;

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setAccessToken(null);
          throw new Error(data.error || 'Session expired');
        }
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function doFetch(url, options) {
  const isForm = options.body instanceof FormData;
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(getAccessToken() && { Authorization: `Bearer ${getAccessToken()}` }),
      ...options.headers,
    },
  });
}

export async function authenticatedFetch(url, options = {}, retry = true) {
  let res = await doFetch(url, options);

  if (res.status === 401 && retry && !url.startsWith('/api/auth/refresh')) {
    try {
      await refreshAccessToken();
      res = await doFetch(url, options);
    } catch {
      return res;
    }
  }

  return res;
}

export async function authJson(url, options = {}, retry = true) {
  const res = await authenticatedFetch(url, options, retry);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fieldErrors =
      data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)
        ? data.errors
        : null;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).flat().find(Boolean)
      : null;
    const error = new Error(data.error || firstFieldError || 'Request failed');
    error.status = res.status;
    error.fieldErrors = fieldErrors;
    throw error;
  }
  return data;
}