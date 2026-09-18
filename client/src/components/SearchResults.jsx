import { Link } from 'react-router-dom';
import { cloudinaryUrl } from '../lib/image';
import { motion } from 'framer-motion';
import { SearchX, Search } from 'lucide-react';

export default function SearchResults({ results, query, onSelect }) {
  const hasQuery = Boolean(query && query.trim());
  const total = results?.length || 0;

  if (!hasQuery) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      {results && results.length > 0 ? (
        <>
          <p className="px-3 pt-2 pb-1 text-[11px] tracking-[0.15em] uppercase text-[var(--text-secondary)]">
            {total} result{total !== 1 ? 's' : ''}
          </p>
          <ul className="py-1">
            {results.map((product) => (
              <li key={product._id}>
                <Link
                  to={`/product/${product._id}`}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-primary)] transition-colors"
                >
                  <img
                    src={cloudinaryUrl(product.images[0], 96)}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      ৳{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {hasQuery && (
            <div className="border-t border-[var(--border)]">
              <Link
                to={`/shop?q=${encodeURIComponent(query.trim())}`}
                onClick={onSelect}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                <Search size={14} aria-hidden="true" />
                View all results
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 px-4 py-4">
          <SearchX size={20} className="text-[var(--text-secondary)] shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm text-[var(--text-primary)]">
              No results for "{query}"
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Try a different keyword.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}