import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function FeaturedRow({ products }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const count = products?.length || 0;

  const step = () => {
    const el = trackRef.current;
    if (!el) return 0;
    const card = el.querySelector(':scope > *');
    const gap = parseInt(getComputedStyle(el).columnGap) || 16;
    return card ? card.getBoundingClientRect().width + gap : el.clientWidth / 2;
  };

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  const scrollByStep = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    return () => el.removeEventListener('scroll', updateArrows);
  }, [count]);

  useEffect(() => {
    if (count === 0) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: step(), behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  return (
    <section className="py-12 sm:py-8 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[26px] sm:text-[20px] font-bold text-[var(--text-primary)]"
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
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-thin scroll-smooth snap-x snap-mandatory pb-1"
          >
            {products.map((product, i) => (
              <div
                key={product._id}
                className="w-[220px] sm:w-[260px] shrink-0 snap-start"
              >
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollByStep(-1)}
            disabled={!canPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[42px] h-[42px] flex items-center justify-center bg-black/40 hover:bg-[var(--accent)] text-white rounded-full transition-colors disabled:opacity-40 disabled:hover:bg-black/40"
            aria-label="Previous featured"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scrollByStep(1)}
            disabled={!canNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-[42px] h-[42px] flex items-center justify-center bg-black/40 hover:bg-[var(--accent)] text-white rounded-full transition-colors disabled:opacity-40 disabled:hover:bg-black/40"
            aria-label="Next featured"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}