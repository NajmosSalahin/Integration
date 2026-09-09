import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg border border-[var(--border)] transition-all duration-300 group-hover:border-[var(--accent)]">
          <div className="aspect-[3/4] overflow-hidden bg-[#111]">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-[11px] tracking-[0.15em] text-gray-300 uppercase">
              {product.tags?.slice(0, 2).join(' / ')}
            </p>
          </div>

          {product.stock?.some(s => !s.inStock) && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] tracking-wider uppercase px-2 py-1 bg-gray-800/90 text-gray-300 rounded-md">
                Limited
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3
            className="text-lg tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-utility)" }}
          >
            {product.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            ৳{(product.price / 100).toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
