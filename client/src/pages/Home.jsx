import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import Footer from '../components/Footer';

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const tagFilter = searchParams.get('tag') || '';

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const filtered = products?.filter((p) => {
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesTag = tagFilter
      ? p.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase())
      : true;
    return matchesSearch && matchesTag;
  });

  const featured = products?.filter((p) =>
    p.tags?.some((t) => t.toLowerCase() === 'popular')
  ).slice(0, 4);

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

        {featured && featured.length > 0 && (
          <section className="py-12 sm:py-8 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-[26px] sm:text-[20px] font-bold text-[var(--text-primary)]"
                  style={{ fontFamily: 'var(--font-utility)' }}
                >
                  Featured Products
                </h2>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-[14px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featured.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 sm:py-8 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-[26px] sm:text-[20px] font-bold text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-utility)' }}
              >
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : tagFilter
                    ? tagFilter
                    : 'Collection'}
              </h2>
              {filtered && (
                <span className="text-[14px] text-[var(--text-secondary)]">
                  {filtered.length} design{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-[#111] rounded-[10px]" />
                    <div className="mt-3 h-4 bg-[#111] rounded w-2/3" />
                    <div className="mt-2 h-3 bg-[#111] rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load products</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{error.message}</p>
              </div>
            )}

            {filtered && filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[var(--text-secondary)]">No designs found</p>
              </div>
            )}

            {filtered && filtered.length > 0 && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {filtered.map((product, i) => (
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
