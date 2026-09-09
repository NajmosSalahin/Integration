import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="bg-[var(--bg-primary)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase text-[var(--text-secondary)] mb-2"
              style={{ fontFamily: "var(--font-utility)" }}
            >
              Simple. Comfortable. Everyday.
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl mb-2 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Different Styles,
              <br />
              One Identity.
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-4 max-w-md">
              Curated t-shirt designs that bridge the gap between bold streetwear and wearable comfort. Each piece is a conversation between contrasting forces.
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-2.5 bg-[var(--accent)] text-white text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-blue-500 transition-colors"
              style={{ fontFamily: "var(--font-utility)" }}
            >
              Shop Collection
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <img
              src="/banner_collage.jpg"
              alt="Integration collection"
              className="w-full aspect-[3/4] object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
