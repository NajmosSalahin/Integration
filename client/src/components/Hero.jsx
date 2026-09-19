import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CLOUD_BASE = 'https://res.cloudinary.com/zo1t9pye/image/upload';
const BANNER_WIDTHS = [480, 900, 1600];
const AUTOPLAY_MS = 6000;
const RESUME_AFTER_INTERACTION_MS = 8000;

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
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const resumeTimerRef = useRef(null);
  const hoveringRef = useRef(false);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (!hoveringRef.current) setPaused(false);
    }, RESUME_AFTER_INTERACTION_MS);
  }, []);

  const pauseForInteraction = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    setPaused(true);
    scheduleResume();
  }, [scheduleResume]);

  const pauseOnHover = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    hoveringRef.current = true;
    setPaused(true);
  }, []);

  const resumeOnLeave = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    hoveringRef.current = false;
    setPaused(false);
  }, []);

  useEffect(() => () => clearTimeout(resumeTimerRef.current), []);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % slides.length);
    setTick((t) => t + 1);
    pauseForInteraction();
  }, [pauseForInteraction]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
    setTick((t) => t + 1);
    pauseForInteraction();
  }, [pauseForInteraction]);

  const goTo = useCallback((i) => {
    setCurrent(i);
    setTick((t) => t + 1);
    pauseForInteraction();
  }, [pauseForInteraction]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
      setTick((t) => t + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const handleVisibility = () => {
      clearTimeout(resumeTimerRef.current);
      if (document.hidden) setPaused(true);
      else setPaused(hoveringRef.current);
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
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full aspect-[2.4/1] lg:h-[600px] lg:aspect-auto overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      onMouseEnter={pauseOnHover}
      onMouseLeave={resumeOnLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          const active = i === current;
          return (
            <img
              key={slide.id}
              src={bannerUrl(slide.id, slide.version, 1600)}
              srcSet={BANNER_WIDTHS.map((w) => `${bannerUrl(slide.id, slide.version, w)} ${w}w`).join(', ')}
              sizes="100vw"
              alt={slide.alt}
              aria-hidden={!active}
              width={1942}
              height={809}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1100ms] ease-out ${
                active
                  ? 'opacity-100 scale-[1.035] delay-[150ms]'
                  : 'opacity-0 scale-100 delay-0'
              } motion-reduce:transition-opacity motion-reduce:duration-500 motion-reduce:delay-0 motion-reduce:scale-100`}
            />
          );
        })}
      </div>

      <div className="absolute inset-0 bg-black/15" />

      <div className="absolute inset-0 z-10 flex items-end justify-center pb-5 sm:pb-10">
        <Link
          to={slides[current].cta}
          className="inline-flex items-center gap-2 bg-[#101010] hover:bg-black md:bg-[#1d4ed8] md:hover:bg-[#1e40af] text-white border border-white/70 md:border-transparent px-7 py-[11px] text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <span key={tick} className="hero-label inline-flex items-center gap-2">
            {slides[current].label}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>
      </div>

      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        {slides.map((_, i) => {
          const active = i === current;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="w-7 h-7 flex items-center justify-center transition-opacity"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active}
            >
              <span
                className={`relative h-[3px] rounded-full overflow-hidden bg-white/40 ${
                  active ? 'w-6' : 'w-4 opacity-55 hover:opacity-90'
                }`}
              >
                {active && (
                  <span
                    key={tick}
                    className="absolute inset-y-0 left-0 bg-white"
                    style={{
                      width: '100%',
                      animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}