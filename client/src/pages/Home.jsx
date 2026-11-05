import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { fetchProducts } from '../api/products';
import { searchProducts } from '../lib/smartSearch';
import { SITE_URL } from '../lib/seo';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedRow from '../components/FeaturedRow';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

const SHOWN_ON_HOME = 16;

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const tagFilter = searchParams.get('tag') || '';
  const collectionRef = useRef(null);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const filtered = products
    ? (searchQuery ? searchProducts(products, searchQuery) : products).filter((p) =>
        tagFilter
          ? p.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase())
          : true
      )
    : undefined;

  const isDefaultView = !searchQuery && !tagFilter;

  const curated =
    isDefaultView && filtered
      ? filtered
          .filter((p) => p.homeCollection === true)
          .sort(
            (a, b) =>
              (a.collectionOrder ?? 0) - (b.collectionOrder ?? 0) ||
              new Date(b.createdAt) - new Date(a.createdAt)
          )
      : filtered;

  const featured = products
    ?.filter((p) => p.featured === true)
    .slice(0, 8);

  const shown = curated?.slice(0, SHOWN_ON_HOME);

  const hideCollection = isDefaultView && !isLoading && !error && curated?.length === 0;

  useEffect(() => {
    if (searchQuery || tagFilter) {
      const el = collectionRef.current;
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, [searchQuery, tagFilter]);

  return (
    <>
      <MetaTags
        title="Integration — Custom T-Shirts & Streetwear Online"
        description="Curated t-shirt designs. Modern Japanese streetwear. Different styles, one identity. Shop the collection now."
        path="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Integration',
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              url: `${SITE_URL}/contact`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Integration',
            url: SITE_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <Hero />

        <CategoryGrid />

        <FeaturedRow products={featured} />

        {!hideCollection && (
        <section ref={collectionRef} className="py-10 lg:py-16 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-[20px] sm:text-[26px] font-bold text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-utility)' }}
              >
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : tagFilter
                    ? tagFilter
                    : 'Collection'}
              </h2>
              <div className="flex items-center gap-3">
                {curated && (
                  <span className="text-sm text-[var(--text-secondary)]" aria-live="polite">
                    {curated.length} design{curated.length !== 1 ? 's' : ''}
                  </span>
                )}
                {curated && curated.length > SHOWN_ON_HOME && (
                  <Link
                    to={`/shop${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : tagFilter ? `?tag=${encodeURIComponent(tagFilter)}` : ''}`}
                    className="text-sm font-medium text-[var(--accent-hover)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                  >
                    View all
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6" aria-busy="true">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-square w-full rounded-[10px]" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <ErrorState
                message="Failed to load products"
                onRetry={() => refetch()}
              />
            )}

            {curated && curated.length === 0 && !error && (
              <EmptyState
                icon={PackageSearch}
                message={searchQuery || tagFilter ? `No designs match "${searchQuery || tagFilter}"` : 'No designs found yet'}
                action={
                  <Link
                    to="/shop"
                    className="inline-block mt-4 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] rounded-lg transition-colors"
                  >
                    Browse all designs
                  </Link>
                }
              />
            )}

            {curated && curated.length > 0 && (
              <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {shown.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </section>
        )}

        <Footer />
      </div>
    </>
  );
}