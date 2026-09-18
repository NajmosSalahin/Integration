const CLOUD_PREFIX = 'res.cloudinary.com';
const CLOUD_UPLOAD = `${CLOUD_PREFIX}/image/upload`;

export function cloudinaryUrl(src, width) {
  if (typeof src !== 'string' || !src.includes(CLOUD_UPLOAD)) return src;
  return src.replace(
    `${CLOUD_UPLOAD}/`,
    `${CLOUD_UPLOAD}/f_auto,q_auto,w_${width}/`
  );
}