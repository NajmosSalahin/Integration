export const SITE_URL = 'https://integration-06n2.onrender.com';

export const SITE_NAME = 'Integration';

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const OG_IMAGE_ALT = 'Integration streetwear collection';

export function buildSeo({
  title,
  description = '',
  path = '/',
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd,
} = {}) {
  const fullTitle = title
    ? title.includes(SITE_NAME)
      ? title
      : `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Different Styles, One Identity`;
  const canonical = SITE_URL + path;
  const ogImage = image || `${SITE_URL}/og-image.png`;

  return {
    title: fullTitle,
    description,
    canonical,
    og: {
      title: fullTitle,
      description,
      url: canonical,
      image: ogImage,
      imageWidth: OG_IMAGE_WIDTH,
      imageHeight: OG_IMAGE_HEIGHT,
      imageAlt: imageAlt || OG_IMAGE_ALT,
      type,
      siteName: SITE_NAME,
    },
    twitter: {
      title: fullTitle,
      description,
      image: ogImage,
    },
    noindex,
    jsonLd,
  };
}
