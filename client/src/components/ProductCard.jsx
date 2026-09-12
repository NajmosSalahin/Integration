import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useCart from '../stores/cartStore';

export default function ProductCard({ product, index }) {
  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.stock?.find((s) => s.inStock)?.size || product.stock?.[0]?.size;
    if (defaultSize) {
      addItem({ product, size: defaultSize });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[#111] transition-all duration-300 group-hover:border-[var(--accent)]">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[16px] font-semibold text-[var(--text-primary)] truncate"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {product.title}
                </h3>
                <p
                  className="text-[15px] text-[var(--text-secondary)] mt-0.5"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  ৳{(product.price / 100).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="shrink-0 w-[36px] h-[36px] flex items-center justify-center border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-colors"
                aria-label={`Add ${product.title} to cart`}
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
