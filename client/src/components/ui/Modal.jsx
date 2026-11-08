import { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

let scrollLocks = 0;
let previousBodyOverflow = '';
const modalStack = [];

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  footer,
  bodyClassName = '',
}) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement;
      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      previousFocus.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    modalStack.push(titleId);
    return () => {
      const index = modalStack.lastIndexOf(titleId);
      if (index !== -1) modalStack.splice(index, 1);
    };
  }, [open, titleId]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key !== 'Escape') return;
      if (modalStack[modalStack.length - 1] !== titleId) return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, titleId]);

  useEffect(() => {
    if (!open) return;
    if (scrollLocks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLocks += 1;
    return () => {
      scrollLocks = Math.max(0, scrollLocks - 1);
      if (scrollLocks === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleTab = (e) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      if (modalStack[modalStack.length - 1] !== titleId) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open, titleId]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative flex w-full ${maxWidth} max-h-[calc(100dvh-2rem)] flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-2xl outline-none`}
          >
            <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
              <h2
                id={titleId}
                className="text-lg font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>
              {children}
            </div>

            {footer && (
              <div className="mt-4 shrink-0 border-t border-[var(--border)] pt-4">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
