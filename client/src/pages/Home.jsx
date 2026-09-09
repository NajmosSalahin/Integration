import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import NewsletterForm from '../components/NewsletterForm';
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

        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-utility)" }}
              >
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : tagFilter
                    ? tagFilter
                    : 'Collection'}
              </h2>
              {filtered && (
                <span className="text-xs text-[var(--text-secondary)] tracking-wider">
                  {filtered.length} design{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-[#111] rounded-sm" />
                    <div className="mt-3 h-4 bg-[#111] rounded w-2/3" />
                    <div className="mt-2 h-3 bg-[#111] rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-400">Failed to load products</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{error.message}</p>
              </div>
            )}

            {filtered && filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[var(--text-secondary)]">No designs found</p>
              </div>
            )}

            {filtered && filtered.length > 0 && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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

        <section className="px-4 sm:px-6 lg:px-8 py-12 border-t border-[var(--border)]">
          <div className="max-w-xl mx-auto">
            <NewsletterForm />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
