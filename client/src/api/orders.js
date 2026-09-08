let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
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
