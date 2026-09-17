export const SITE_URL = 'https://integration-06n2.onrender.com';

export const SITE_NAME = 'Integration';

export function buildSeo({
  title,
  description = '',
  path = '/',
  image,
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
