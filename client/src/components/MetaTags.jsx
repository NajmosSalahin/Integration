import { Helmet } from 'react-helmet-async';
import { buildSeo } from '../lib/seo';

export default function MetaTags({
  title = '',
  description = '',
  path = '/',
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const seo = buildSeo({ title, description, path, image, imageAlt, type, noindex, jsonLd });

  return (
    <Helmet>
      <title>{seo.title}</title>
      {seo.description && <meta name="description" content={seo.description} />}
      <link rel="canonical" href={seo.canonical} />
      <meta name="robots" content={seo.noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:title" content={seo.og.title} />
      <meta property="og:description" content={seo.og.description} />
      <meta property="og:url" content={seo.og.url} />
      <meta property="og:image" content={seo.og.image} />
      <meta property="og:image:width" content={String(seo.og.imageWidth)} />
      <meta property="og:image:height" content={String(seo.og.imageHeight)} />
      <meta property="og:image:alt" content={seo.og.imageAlt} />
      <meta property="og:type" content={seo.og.type} />
      <meta property="og:site_name" content={seo.og.siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.twitter.title} />
      <meta name="twitter:description" content={seo.twitter.description} />
      <meta name="twitter:image" content={seo.twitter.image} />

      {seo.jsonLd &&
        (Array.isArray(seo.jsonLd) ? (
          seo.jsonLd.map((item, i) => (
            <script
              key={i}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
            />
          ))
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.jsonLd) }}
          />
        ))}
    </Helmet>
  );
}