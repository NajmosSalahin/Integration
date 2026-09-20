import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const t = { id, type: 'info', duration: 4000, ...toast };
    set({ toasts: [...get().toasts, t] });
    if (t.duration > 0) {
      setTimeout(() => get().removeToast(id), t.duration);
    }
    return id;
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export function useToast() {
  return useToastStore((s) => s.addToast);
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'border-emerald-400/40',
  error: 'border-red-400/40',
  info: 'border-blue-400/40',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-md max-w-sm shadow-lg bg-black/75 text-white border-white/10 ${colors[toast.type]}`}
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
              <p className="text-sm flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
