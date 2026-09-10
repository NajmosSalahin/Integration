import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ShopProductCard from '../components/ShopProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const allTags = products
    ? [...new Set(products.flatMap((p) => p.tags || []))].sort()
    : [];

  const filtered = products?.filter((p) => {
    if (!tagFilter) return true;
    return p.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase());
  });

  const handleTagChange = (tag) => {
    if (tag) {
      setSearchParams({ tag });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <Helmet>
        <title>Shop — Integration</title>
        <meta name="description" content="Browse all Integration t-shirt designs. Different styles, one identity." />
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-5"
              style={{ fontFamily: 'var(--font-utility)' }}
            >
              Shop
            </h1>

            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                <button
                  onClick={() => handleTagChange('')}
                  className={`px-4 py-2 text-sm rounded-full border transition-colors whitespace-nowrap ${
                    !tagFilter
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(tag)}
                    className={`px-4 py-2 text-sm rounded-full border transition-colors whitespace-nowrap ${
                      tagFilter === tag
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {filtered && (
                <span
                  className="text-sm text-[var(--text-secondary)] whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {filtered.length} design{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-[#111] rounded-[10px]" />
                    <div className="mt-2 h-3 bg-[#111] rounded w-2/3" />
                    <div className="mt-1.5 h-3 bg-[#111] rounded w-1/3" />
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
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {filtered.map((product, i) => (
                  <ShopProductCard key={product._id} product={product} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
