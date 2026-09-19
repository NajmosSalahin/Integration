const CLOUD_PREFIX = 'res.cloudinary.com';
const CLOUD_UPLOAD = `${CLOUD_PREFIX}/image/upload`;

export function cloudinaryUrl(src, width) {
  if (typeof src !== 'string' || !src.includes(CLOUD_UPLOAD)) return src;
  return src.replace(
    `${CLOUD_UPLOAD}/`,
    `${CLOUD_UPLOAD}/f_auto,q_auto,w_${width}/`
  );
}

export const IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%25' height='100%25' fill='%23222a35'/><circle cx='40' cy='34' r='12' fill='%2364748b'/><path d='M14 66c2-12 10-18 26-18s24 6 26 18z' fill='%2364748b'/></svg>";