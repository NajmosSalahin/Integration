import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { fetchProducts } from '../api/products';
import { searchProducts } from '../lib/smartSearch';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedRow from '../components/FeaturedRow';
import Footer from '../components/Footer';
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

  const featured = products
    ?.filter((p) => p.featured === true)
    .slice(0, 8);

  const shown = filtered?.slice(0, SHOWN_ON_HOME);

  useEffect(() => {
    if (searchQuery || tagFilter) {
      collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery, tagFilter]);

  return (
    <>
      <Helmet>
        <title>Integration — Different Styles, One Identity</title>
        <meta name="description" content="Curated t-shirt designs. Modern Japanese streetwear. Different styles, one identity." />
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <Hero />

        <CategoryGrid />

        <FeaturedRow products={featured} />

        <section ref={collectionRef} className="py-12 sm:py-8 lg:py-20 scroll-mt-20">
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
                {filtered && (
                  <span className="text-[14px] text-[var(--text-secondary)]" aria-live="polite">
                    {filtered.length} design{filtered.length !== 1 ? 's' : ''}
                  </span>
                )}
                {filtered && filtered.length > SHOWN_ON_HOME && (
                  <Link
                    to={`/shop${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : tagFilter ? `?tag=${encodeURIComponent(tagFilter)}` : ''}`}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
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

            {filtered && filtered.length === 0 && !error && (
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

            {filtered && filtered.length > 0 && (
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

        <Footer />
      </div>
    </>
  );
}