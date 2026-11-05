export function parseAllowedOrigins(value) {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin, allowedOrigins) {
  return !origin || allowedOrigins.includes(origin);
}
