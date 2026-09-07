import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const accentBlue = '#3b82f6';

export default function ProductCard({ product, index }) {
  const isFeatured = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={isFeatured ? 'col-span-2 row-span-2' : ''}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative overflow-hidden rounded-sm border border-gray-800 transition-all duration-300 group-hover:border-blue-500 group-hover:scale-[1.02]">
          <div className="aspect-[3/4] overflow-hidden bg-gray-900">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-xs tracking-[0.2em] text-gray-400 uppercase">
              {product.tags?.slice(0, 2).join(' / ')}
            </p>
          </div>

          <div className="absolute top-3 right-3">
            {product.stock?.some(s => !s.inStock) && (
              <span className="text-[10px] tracking-wider uppercase px-2 py-1 bg-gray-800/80 text-gray-400 rounded-sm">
                Limited
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3
            className="text-lg tracking-[0.15em] uppercase"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {product.title}
          </h3>
          <p className="text-sm text-gray-400">
            ৳{(product.price / 100).toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
