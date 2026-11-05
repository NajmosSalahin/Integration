export function parseTrustProxy(value) {
  if (value === undefined || value === '') {
    return false;
  }

  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
  }

  return hops === 0 ? false : hops;
}
