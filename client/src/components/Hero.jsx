import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  { image: '/banner1.jpg', alt: 'New Collection' },
  { image: '/banner2.jpg', alt: 'Street Essentials' },
  { image: '/banner3.jpg', alt: 'Featured Designs' },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <img
            key={i}
            src={slide.image}
            alt={slide.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="space-y-3">
          <p
            className="text-[var(--text-secondary)] text-[13px] sm:text-[12px] tracking-[1.5px] uppercase"
            style={{ fontFamily: 'var(--font-utility)' }}
          >
            Simple. Comfortable. Everyday.
          </p>
          <h1
            className="text-[var(--text-primary)] text-[56px] sm:text-[34px] lg:text-[56px] leading-none font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            INTEGRATION
          </h1>
          <p
            className="text-[var(--text-secondary)] text-[18px] sm:text-[15px]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Different Styles, One Identity
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-7 py-[11px] text-sm font-medium transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? 'bg-white' : 'bg-white/30'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
