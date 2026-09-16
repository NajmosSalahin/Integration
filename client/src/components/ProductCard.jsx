import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import useCart from '../stores/cartStore';
import { useToast } from './ui/Toast';

export default function ProductCard({ product, index }) {
  const addItem = useCart((s) => s.addItem);
  const toast = useToast();
  const [added, setAdded] = useState(false);

  const instock = product.stock?.some((s) => s.inStock);
  const defaultSize = product.stock?.find((s) => s.inStock)?.size || product.stock?.[0]?.size;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!instock || !defaultSize) return;
    addItem({ product, size: defaultSize });
    toast({ type: 'success', message: `${product.title} (${defaultSize}) added to cart` });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="group relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[#111] transition-all duration-300 group-hover:border-[var(--accent)]">
        <Link
          to={`/product/${product._id}`}
          className="block"
          aria-label={product.title}
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="p-5">
            <h3
              className="text-[16px] font-semibold text-[var(--text-primary)] truncate"
              style={{ fontFamily: 'var(--font-body)' }}
              title={product.title}
            >
              {product.title}
            </h3>
            <p
              className="text-[15px] text-[var(--text-secondary)] mt-0.5"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              ৳{product.price.toLocaleString()}
            </p>
          </div>
        </Link>

        <div className="absolute top-3 right-3 flex gap-2">
          {!instock && (
            <span className="px-2 py-1 bg-black/70 text-white text-[10px] tracking-[0.15em] uppercase rounded-md">
              Sold out
            </span>
          )}
          <button
            onClick={handleAddToCart}
            disabled={!instock}
            aria-label={instock ? `Add ${product.title} to cart` : `${product.title} is out of stock`}
            aria-disabled={!instock}
            className={`shrink-0 w-[36px] h-[36px] flex items-center justify-center border rounded-lg transition-all ${
              added
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : instock
                  ? 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white'
                  : 'border-[var(--border)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
            }`}
          >
            {added ? <Check size={18} aria-hidden="true" /> : <ShoppingCart size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}