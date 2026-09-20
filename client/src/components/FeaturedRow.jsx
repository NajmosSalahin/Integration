import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function FeaturedRow({ products }) {
  const trackRef = useRef(null);
  const [cardSize, setCardSize] = useState(0);
  const [position, setPosition] = useState(0);
  const [noAnim, setNoAnim] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const count = products?.length || 0;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const card = el.querySelector(':scope > *');
      const gap = parseInt(getComputedStyle(el).columnGap) || 16;
      setCardSize(card ? card.getBoundingClientRect().width + gap : el.clientWidth / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [count]);

  const go = useCallback((dir) => {
    if (count < 2) return;
    if (dir === -1 && ((position % count) + count) % count === 0) {
      setNoAnim(true);
      setPosition(position + count - 1);
      return;
    }
    setPosition((p) => p + dir);
  }, [position, count]);

  useEffect(() => {
    if (position >= count) {
      setNoAnim(true);
      setPosition(0);
    } else if (position < 0) {
      setNoAnim(true);
      setPosition(position + count);
    } else {
      setNoAnim(false);
    }
  }, [position, count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [count, paused, go]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (count === 0) return null;

  const deck = [...products, ...products];

  return (
    <section className="py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[20px] sm:text-[26px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-utility)' }}
          >
            Featured Products
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[14px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            View All
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex gap-4 sm:gap-6 px-14 transition-transform duration-[400ms] ease-out motion-reduce:transition-none"
            style={{
              transform: `translateX(${-position * cardSize}px)`,
              transition: noAnim ? 'none' : undefined,
            }}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured products"
            aria-live="off"
          >
            {deck.map((product, i) => (
              <div
                key={`${product._id}-${i >= count ? 'b' : 'a'}`}
                className="w-[220px] sm:w-[260px] shrink-0"
              >
                <ProductCard product={product} index={i % count} />
              </div>
            ))}
          </div>

          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[42px] h-[42px] flex items-center justify-center bg-black/40 hover:bg-[var(--accent)] text-white rounded-full transition-colors"
            aria-label="Previous featured"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-[42px] h-[42px] flex items-center justify-center bg-black/40 hover:bg-[var(--accent)] text-white rounded-full transition-colors"
            aria-label="Next featured"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}