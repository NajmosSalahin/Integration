const UNSAFE_PATH = /%2f|%5c|\\/i;

export function normalizeRedirectTarget(pathname) {
  if (UNSAFE_PATH.test(pathname)) return null;

  const trimmed = pathname.replace(/\/+$/, '');
  const normalized = trimmed.replace(/^\/+/, '/');

  return normalized === '' ? '/' : normalized;
}
