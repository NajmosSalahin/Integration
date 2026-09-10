import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useCart from '../stores/cartStore';

export default function ShopProductCard({ product, index }) {
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

          <div className="p-3">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                {product.tags?.length > 0 && (
                  <div className="flex gap-1.5 mb-1.5">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-[0.15em] uppercase px-1.5 py-0.5 border border-[var(--border)] text-[var(--text-secondary)] rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h3
                  className="text-[14px] font-semibold text-[var(--text-primary)] truncate"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {product.title}
                </h3>
                <p
                  className="text-[14px] text-[var(--text-secondary)] mt-0.5"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  ৳{(product.price / 100).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="shrink-0 w-[30px] h-[30px] flex items-center justify-center border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white transition-colors"
                aria-label={`Add ${product.title} to cart`}
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
