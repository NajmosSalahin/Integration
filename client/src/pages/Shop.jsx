import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { searchProducts } from '../lib/smartSearch';
import ShopProductCard from '../components/ShopProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Pagination from '../components/ui/Pagination';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { categories } from '../data/categories';

const PER_PAGE = 16;

const SORTS = [
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'oldest', label: 'Sort: Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = Number(searchParams.get('page')) || 1;
  const page = pageParam < 1 ? 1 : pageParam;

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const filtered = useMemo(() => {
    if (!products) return undefined;
    const base = searchQuery ? searchProducts(products, searchQuery) : products;
    return tagFilter
      ? base.filter((p) => p.tags?.some((t) => t.toLowerCase() === tagFilter.toLowerCase()))
      : base;
  }, [products, searchQuery, tagFilter]);

  const sorted = filtered ? [...filtered] : undefined;
  if (sorted && !searchQuery) {
    switch (sort) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  const totalPages = sorted ? Math.max(1, Math.ceil(sorted.length / PER_PAGE)) : 1;
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageItems = sorted?.slice(start, start + PER_PAGE);

  useEffect(() => {
    if (safePage !== page) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(safePage));
      setSearchParams(next, { replace: true });
    }
  }, [safePage, page, searchParams, setSearchParams]);

  const setParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value == null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  const handleTagChange = (tag) => {
    if (tag) {
      setParams({ tag, page: '' });
    } else {
      setParams({ tag: '', page: '' });
    }
  };

  const handleSortChange = (e) => {
    setParams({ sort: e.target.value, page: '' });
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

  const rangeStart = sorted?.length ? start + 1 : 0;
  const rangeEnd = sorted ? Math.min(start + PER_PAGE, sorted.length) : 0;

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
              <div className="relative flex-1 min-w-0 lg:hidden">
                <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
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
                <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[var(--bg-primary)] to-transparent" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <label htmlFor="shop-sort" className="sr-only">Sort products</label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={handleSortChange}
                  disabled={Boolean(searchQuery)}
                  title={searchQuery ? 'Sorting is unavailable while searching — search results are relevance-ordered.' : undefined}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-40"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-busy="true">
                    {[...Array(8)].map((_, i) => (
                      <div key={i}>
                        <Skeleton className="aspect-square w-full rounded-[10px]" />
                        <Skeleton className="mt-2 h-3 w-2/3" />
                        <Skeleton className="mt-1.5 h-3 w-1/3" />
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

                {sorted && sorted.length === 0 && !error && (
                  <EmptyState
                    message={searchQuery || tagFilter ? `No designs match "${searchQuery || tagFilter}"` : 'No designs found yet'}
                    actionLabel="Clear filters"
                    onAction={() => setParams({ q: '', tag: '', page: '' })}
                  />
                )}

                {sorted && sorted.length > 0 && (
                  <div className="flex items-center justify-between mb-5" aria-live="polite">
                    <p className="text-sm text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                      {sorted.length} design{sorted.length !== 1 ? 's' : ''}
                    </p>
                    {searchQuery ? (
                      <p className="text-sm text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                        Results for "{searchQuery}"
                      </p>
                    ) : totalPages > 1 ? (
                      <p className="text-sm text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-body)' }}>
                        Showing {rangeStart}–{rangeEnd}
                      </p>
                    ) : null}
                  </div>
                )}

                {sorted && sorted.length > 0 && (
                  <>
                    <motion.div
                      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.08 } },
                      }}
                    >
                      {pageItems.map((product, i) => (
                        <ShopProductCard key={product._id} product={product} index={i} />
                      ))}
                    </motion.div>

                    <Pagination
                      current={safePage}
                      total={totalPages}
                      onChange={(n) => setParams({ page: n === 1 ? '' : n })}
                      className="mt-8"
                    />
                  </>
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