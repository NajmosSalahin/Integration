import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { fetchProducts } from '../api/products';

const categories = [
  { name: 'T-Shirts', tag: 't-shirts' },
  { name: 'Hoodies', tag: 'hoodies' },
  { name: 'Shirts', tag: 'shirts' },
];

export default function CategoryGrid() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const getCategoryImage = (tag) => {
    if (!products) return null;
    const match = products.find((p) =>
      p.tags?.some((t) => t.toLowerCase() === tag)
    );
    return match?.images?.[0] || null;
  };

  return (
    <section className="py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-[26px] sm:text-[20px] font-bold text-[var(--text-primary)] mb-6"
          style={{ fontFamily: 'var(--font-utility)' }}
        >
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => {
            const image = getCategoryImage(category.tag);
            return (
              <Link
                key={category.tag}
                to={`/shop?tag=${category.tag}`}
                className="group relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[#111] transition-all duration-300 hover:border-[var(--accent)]"
              >
                <div className="flex items-center min-h-[140px]">
                  <div className="w-1/3 aspect-square shrink-0 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--border)] animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 px-6 py-5">
                    <h3
                      className="text-[16px] font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {category.name}
                    </h3>
                    <ArrowRight
                      size={18}
                      className="mt-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
