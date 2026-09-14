import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const variants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export default function FeaturedCarousel({ products }) {
  const [[index, direction], setState] = useState([0, 0]);
  const timerRef = useRef(null);

  const count = products?.length || 0;

  const paginate = (dir) => {
    if (count === 0) return;
    setState(([i]) => [(i + dir + count) % count, dir]);
  };

  useEffect(() => {
    if (count === 0) return;
    timerRef.current = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timerRef.current);
  }, [count, index]);

  if (count === 0) return null;

  const product = products[index];

  return (
    <section className="py-12 sm:py-8 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[26px] sm:text-[20px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-utility)' }}
          >
            Featured
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[14px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            View All
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[#111]">
          <div className="relative aspect-[16/7] sm:aspect-[16/6]">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={product._id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: ['easeInOut', 0.35, 0.35, 1] }}
                className="absolute inset-0"
              >
                <Link to={`/product/${product._id}`} className="relative block w-full h-full">
                  <img
                    src={product.images?.[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-xl px-6 sm:px-10">
                      <p
                        className="text-[12px] tracking-[0.2em] uppercase text-[var(--accent)] mb-2"
                        style={{ fontFamily: 'var(--font-utility)' }}
                      >
                        Featured Design
                      </p>
                      <h3
                        className="text-[22px] sm:text-[28px] font-bold text-white leading-tight"
                        style={{ fontFamily: 'var(--font-utility)' }}
                      >
                        {product.title}
                      </h3>
                      <p
                        className="mt-3 text-[15px] text-white/80 font-medium"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        ৳{product.price.toLocaleString()}
                      </p>
                      <span
                        className="inline-flex items-center gap-2 mt-5 text-[13px] tracking-[0.15em] uppercase text-white border border-white/30 hover:border-[var(--accent)] hover:text-[var(--accent)] px-5 py-2.5 transition-colors"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        View Product
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-[42px] h-[42px] flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
            aria-label="Previous feature"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-[42px] h-[42px] flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
            aria-label="Next feature"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-1.5">
            {products.map((p, i) => (
              <button
                key={p._id}
                onClick={() => setState(([, d]) => [i, i > index ? 1 : -1])}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
