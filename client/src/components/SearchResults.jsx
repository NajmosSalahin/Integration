import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SearchResults({ results, onSelect }) {
  if (!results || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111] border border-[var(--border)] rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      <ul className="py-1">
        {results.slice(0, 6).map((product) => (
          <li key={product._id}>
            <Link
              to={`/product/${product._id}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-primary)] transition-colors"
            >
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-12 h-12 rounded-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {product.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  ৳{(product.price / 100).toLocaleString()}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
