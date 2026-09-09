import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Streetwear', tag: 'streetwear', color: 'bg-blue-900/30' },
  { name: 'Graphic', tag: 'graphic', color: 'bg-purple-900/30' },
  { name: 'Neon', tag: 'neon', color: 'bg-pink-900/30' },
  { name: 'Minimal', tag: 'minimal', color: 'bg-gray-800/50' },
  { name: 'Kanji', tag: 'kanji', color: 'bg-red-900/30' },
  { name: 'Abstract', tag: 'abstract', color: 'bg-green-900/30' },
];

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="hand-drawn-underline text-3xl text-center mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Shop by Category
        </h2>
        <p className="text-center text-sm text-[var(--text-secondary)] mb-8">
          Each design tells a story — find yours
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category, i) => (
            <Link
              key={category.tag}
              to={`/?tag=${category.tag}`}
              className={category.color + ' rounded-xl p-6 flex flex-col items-center text-center group transition-transform hover:scale-105'}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="w-16 h-16 bg-[var(--border)] rounded-full mb-3 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-colors"
              >
                <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-white">
                  {category.name[0]}
                </span>
              </motion.div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
