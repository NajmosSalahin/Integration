import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="bg-[var(--bg-card)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase text-[var(--text-secondary)] mb-4"
              style={{ fontFamily: "var(--font-utility)" }}
            >
              Simple. Comfortable. Everyday.
            </p>
            <h1
              className="text-4xl sm:text-5xl mb-4 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Different Styles,
              <br />
              One Identity.
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md">
              Curated t-shirt designs that bridge the gap between bold streetwear and wearable comfort. Each piece is a conversation between contrasting forces.
            </p>
            <Link
              to="/cart"
              className="inline-block px-8 py-3 bg-[var(--accent)] text-white text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-blue-600 transition-colors"
              style={{ fontFamily: "var(--font-utility)" }}
            >
              Shop Collection
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl flex items-center justify-center border border-[var(--border)]">
              <img
                src="/logo.png"
                alt="Integration"
                className="max-w-[60%] opacity-30"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
