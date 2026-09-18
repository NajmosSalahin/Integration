import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLOUD_BASE = 'https://res.cloudinary.com/zo1t9pye/image/upload';
const BANNER_WIDTHS = [480, 900, 1600];

const slides = [
  { id: 'banner1', version: 'v1789713367', alt: 'New Collection', cta: '/shop', label: 'Shop New Collection' },
  { id: 'banner2', version: 'v1789713379', alt: 'Street Essentials', cta: '/shop?tag=streetwear', label: 'Shop Street Essentials' },
  { id: 'banner3', version: 'v1789713387', alt: 'Featured Designs', cta: '/shop', label: 'Shop Featured Designs' },
];

const bannerUrl = (id, version, width) =>
  `${CLOUD_BASE}/f_auto,q_auto,w_${width}/${version}/integration/banners/${id}`;

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><rect width="100%25" height="100%25" fill="%23111111"/></svg>';

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((i) => {
    setCurrent(i);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setPaused(true);
      else setPaused(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
      setPaused(true);
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full aspect-[2.4/1] lg:h-[600px] lg:aspect-auto overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <img
            key={i}
            src={bannerUrl(slide.id, slide.version, 1600)}
            srcSet={BANNER_WIDTHS.map((w) => `${bannerUrl(slide.id, slide.version, w)} ${w}w`).join(', ')}
            sizes="100vw"
            alt={slide.alt}
            aria-hidden={i !== current}
            width={1942}
            height={809}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 z-10 flex items-end justify-center pb-5 sm:pb-10">
        <Link
          to={slides[current].cta}
          className="inline-flex items-center gap-2 bg-transparent md:bg-[var(--accent)] hover:bg-white/10 md:hover:bg-[var(--accent)]/90 text-white border border-white/70 md:border-transparent px-7 py-[11px] text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {slides[current].label}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <button
        onClick={() => { prev(); setPaused(true); }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] flex items-center justify-center bg-black/20 hover:bg-black/35 text-white rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <button
        onClick={() => { next(); setPaused(true); }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] flex items-center justify-center bg-black/20 hover:bg-black/35 text-white rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>

      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); setPaused(true); }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? 'bg-white' : 'bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current}
          />
        ))}
      </div>
    </section>
  );
}