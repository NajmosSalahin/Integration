import { statSync } from 'fs';

const SITE_NAME = 'Integration';

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

const htmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const buildFullTitle = (title) =>
  !title
    ? `${SITE_NAME} — Different Styles, One Identity`
    : title.includes(SITE_NAME)
      ? title
      : `${title} — ${SITE_NAME}`;

export const isValidObjectId = (value) => OBJECT_ID_RE.test(value);

const NOINDEX_PATTERNS = [
  /^\/cart$/,
  /^\/checkout$/,
  /^\/login$/,
  /^\/signup$/,
  /^\/forgot-password$/,
  /^\/reset-password$/,
  /^\/verify-email$/,
  /^\/orders$/,
  /^\/account$/,
  /^\/order$/,
  /^\/order\/.+$/,
  /^\/order-confirmation$/,
  /^\/order-confirmation\/.+$/,
  /^\/admin(\/.*)?$/,
];

export const isNoindexRoute = (path) => NOINDEX_PATTERNS.some((re) => re.test(path));

export function buildStaticRoutes(siteUrl) {
  return {
    '/': {
      title: 'Integration — Custom T-Shirts & Streetwear Online',
      description:
        'Curated t-shirt designs. Modern Japanese streetwear. Different styles, one identity. Shop the collection now.',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: `${siteUrl}/contact`,
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: siteUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    },
    '/shop': {
      title: 'Shop',
      description:
        'Browse all Integration t-shirt designs. Filter by category, search by name. Different styles, one identity.',
    },
    '/faq': {
      title: 'FAQ',
      description:
        'Find answers to common questions about orders, payments, sizing, delivery, and returns at Integration.',
    },
    '/shipping': {
      title: 'Shipping Policy',
      description: 'Shipping rates and delivery timeframes for orders within Bangladesh.',
    },
    '/returns': {
      title: 'Returns & Refunds',
      description:
        'Our return and refund policy — what to do if your item arrives damaged or incorrect.',
    },
    '/payments': {
      title: 'Payments',
      description:
        'Accepted payment methods including bKash, Nagad, Rocket, and cash on delivery for orders placed on Integration.',
    },
    '/privacy': {
      title: 'Privacy Policy',
      description: 'How Integration handles your personal data and protects your privacy.',
    },
    '/cookies': {
      title: 'Cookie Policy',
      description: 'What cookies Integration uses and how to manage your preferences.',
    },
    '/terms': {
      title: 'Terms of Service',
      description: 'Terms and conditions governing use of the Integration storefront.',
    },
    '/about': {
      title: 'About Us',
      description:
        'Learn about Integration — our story, mission, and the vision behind our curated streetwear collection.',
    },
    '/contact': {
      title: 'Contact Us',
      description:
        "Reach out to the Integration team. We're here to help with orders, sizing, and more.",
    },
  };
}

export function productJsonLd(product, siteUrl) {
  const inStock = product.stock?.some((s) => s.inStock);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.[0] ? [product.images[0]] : undefined,
    description: product.description,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BDT',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/product/${product._id}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

const replaceMetaContent = (html, attr, key, value) =>
  html.replace(new RegExp(`(${attr}="${key}" content=")[^"]*(")`), (_m, pre, post) =>
    `${pre}${htmlEscape(value)}${post} data-seo="ssr"`
  );

const markSocialTags = (html) =>
  html.replace(/<meta (?=[^>]*(?:property="og:|name="twitter:))[^>]*>/g, (tag) =>
    tag.includes('data-seo') ? tag : tag.replace(/(\s*\/?>)$/, ' data-seo="ssr"$1')
  );

export function applySeo(template, { title, description = '', canonical, robots = 'index, follow', image, jsonLd } = {}) {
  const fullTitle = buildFullTitle(title);

  let html = template.replace(
    /<title>[\s\S]*?<\/title>/,
    () => `<title>${htmlEscape(fullTitle)}</title>`
  );

  html = replaceMetaContent(html, 'property', 'og:title', fullTitle);
  html = replaceMetaContent(html, 'name', 'twitter:title', fullTitle);

  if (description) {
    html = replaceMetaContent(html, 'property', 'og:description', description);
    html = replaceMetaContent(html, 'name', 'twitter:description', description);
  }

  if (image) {
    html = replaceMetaContent(html, 'property', 'og:image', image);
    html = replaceMetaContent(html, 'name', 'twitter:image', image);
  }

  const headTags = [];

  if (description) {
    headTags.push(
      `<meta name="description" content="${htmlEscape(description)}" data-seo="ssr">`
    );
  }
  headTags.push(`<link rel="canonical" href="${htmlEscape(canonical)}" data-seo="ssr">`);
  headTags.push(
    `<meta name="robots" content="${htmlEscape(robots)}" data-seo="ssr">`
  );
  headTags.push(
    `<meta property="og:url" content="${htmlEscape(canonical)}" data-seo="ssr">`
  );

  const items = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  for (const item of items) {
    const payload = JSON.stringify(item).replace(/</g, '\\u003c');
    headTags.push(
      `<script type="application/ld+json" data-seo="ssr">${payload}</script>`
    );
  }

  html = markSocialTags(html);

  return html.replace('</head>', () => `${headTags.join('\n    ')}\n  </head>`);
}

export function staticLastmod(indexPath) {
  try {
    return statSync(indexPath).mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
