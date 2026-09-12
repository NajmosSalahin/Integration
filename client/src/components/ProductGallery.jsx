import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X } from 'lucide-react';

export default function ProductGallery({ images }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') closeLightbox();
    },
    [closeLightbox]
  );

  useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, handleKeyDown]);

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square overflow-hidden rounded-sm bg-gray-900 border border-gray-800 cursor-zoom-in"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxOpen(true)}
        role="button"
        aria-label="Zoom image"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt="Product"
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
          <ZoomIn size={16} />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(i);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors duration-200 ${
                i === selectedIndex
                  ? 'border-blue-500'
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              <img
                src={img}
                alt={`View ${i + 1}`}
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
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Close zoom"
            >
              <X size={28} />
            </button>

            <motion.img
              src={images[selectedIndex]}
              alt="Product zoomed"
              className="max-h-[90vh] max-w-[90vw] object-contain"
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