import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGallery({ images }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeRef = useRef(null);
  const previousFocus = useRef(null);
  const touchStartX = useRef(null);

  if (!images || images.length === 0) return null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxOpen) {
      previousFocus.current = document.activeElement;
      const t = setTimeout(() => closeRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      previousFocus.current?.focus();
    }
  }, [lightboxOpen]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const lbPrev = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const lbNext = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'ArrowRight') lbNext();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, closeLightbox, lbPrev, lbNext]);

  useEffect(() => {
    if (!lightboxOpen || !closeRef.current) return;
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const el = closeRef.current;
      if (!el) return;
      e.preventDefault();
      el.focus();
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [lightboxOpen]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) lbNext();
      else lbPrev();
    }
    touchStartX.current = null;
  };

  const openLightbox = () => {
    previousFocus.current = document.activeElement;
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-secondary)] cursor-zoom-in"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
          }
        }}
        aria-label="Zoom image"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`Product image ${selectedIndex + 1}`}
            width={800}
            height={800}
            className={`h-full w-full object-cover transition-transform duration-300 ${
              isHovering ? 'scale-[2]' : 'scale-100'
            }`}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        <div className="absolute top-2 right-2 p-1.5 bg-black/60 text-white/80 rounded-sm pointer-events-none">
          <ZoomIn size={16} aria-hidden="true" />
        </div>
      </div>

      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          role="radiogroup"
          aria-label="Product image thumbnails"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(i);
              }}
              aria-current={i === selectedIndex}
              aria-label={`View image ${i + 1}`}
              className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors duration-200 ${
                i === selectedIndex
                  ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
                  : 'border-[var(--border)] hover:border-[var(--text-secondary)]'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed product image"
          >
            <button
              ref={closeRef}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Close zoom"
            >
              <X size={28} aria-hidden="true" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-[44px] h-[44px] flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); lbNext(); }}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-[44px] h-[44px] flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} aria-hidden="true" />
                </button>
              </>
            )}

            <motion.img
              src={images[selectedIndex]}
              alt={`Product zoomed — image ${selectedIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain select-none"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}