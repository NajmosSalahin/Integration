import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ShopProductCard from '../components/ShopProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { categories } from '../data/categories';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

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

  const pillClass = (active) =>
    `px-4 py-2 text-sm rounded-full border transition-colors whitespace-nowrap ${
      active
        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
    }`;

  const sidebarClass = (active) =>
    `flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-[8px] text-sm border transition-colors ${
      active
        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
        : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]'
    }`;

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
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 lg:hidden">
                <button
                  onClick={() => handleTagChange('')}
                  className={pillClass(!tagFilter)}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.tag}
                    onClick={() => handleTagChange(category.tag)}
                    className={pillClass(tagFilter === category.tag)}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {category.name}
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

            <div className="lg:flex lg:gap-8">
              <aside className="hidden lg:block w-60 shrink-0">
                <div className="sticky top-6 space-y-1">
                  <button
                    onClick={() => handleTagChange('')}
                    className={sidebarClass(!tagFilter)}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.tag}
                      onClick={() => handleTagChange(category.tag)}
                      className={sidebarClass(tagFilter === category.tag)}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="flex-1 min-w-0">
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
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}