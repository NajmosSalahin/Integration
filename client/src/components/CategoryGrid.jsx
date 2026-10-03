import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Shirt, Shield, Crown, Footprints, ShoppingBag, Backpack, BaggageClaim, Briefcase, TvMinimal, BookOpenText } from 'lucide-react';
import { fetchProducts } from '../api/products';
import { fetchCategories } from '../api/categories';
import { categories } from '../data/categories';
import { cloudinaryUrl } from '../lib/image';

const iconMap = { Shirt, Shield, Crown, Footprints, ShoppingBag, Backpack, BaggageClaim, Briefcase, TvMinimal, BookOpenText };

export default function CategoryGrid() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: liveCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const getCategoryImage = (tag) => {
    if (!products) return null;
    const match = products.find((p) =>
      p.tags?.some((t) => t.toLowerCase() === tag)
    );
    return cloudinaryUrl(match?.images?.[0], 240) || null;
  };

  const allCategories = liveCategories && liveCategories.length > 0 ? liveCategories : categories;
  const homeCategories = allCategories.filter((c) => c.home);

  return (
    <section className="py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-[20px] sm:text-[26px] font-bold text-[var(--text-primary)] mb-6"
          style={{ fontFamily: 'var(--font-utility)' }}
        >
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-center min-h-0 sm:min-h-[140px]">
                    <div className="w-full sm:w-1/3 aspect-square shrink-0 bg-[var(--border)] animate-pulse" />
                    <div className="flex-1 w-full px-3 py-4 sm:px-6 sm:py-5 space-y-2">
                      <div className="h-4 bg-[var(--border)] rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-[var(--border)] rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            : homeCategories.map((category) => {
                const image = category.image
                  ? cloudinaryUrl(category.image, 240) || getCategoryImage(category.tag)
                  : getCategoryImage(category.tag);
                const Icon = iconMap[category.icon];
                return (
                  <Link
                    key={category.tag}
                    to={`/shop?tag=${category.tag}`}
                    className="group relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-300 hover:border-[var(--accent)]"
                    aria-label={`Shop ${category.name}`}
                  >
                    <div className="flex flex-col sm:flex-row items-center min-h-0 sm:min-h-[140px]">
                      <div className="w-full sm:w-1/3 aspect-square shrink-0 overflow-hidden">
                        {image ? (
                          <img
                            src={image}
                            alt={category.name}
                            width="120"
                            height="120"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : Icon ? (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--border)]">
                            <Icon size={40} strokeWidth={1.5} aria-hidden="true" className="transition-colors group-hover:text-[var(--accent)]" />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0 w-full px-3 py-3 sm:px-6 sm:py-5">
                        <h3
                          className="text-[14px] sm:text-[16px] font-semibold text-[var(--text-primary)] line-clamp-2"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {category.name}
                        </h3>
                        <ArrowRight
                          size={18}
                          aria-hidden="true"
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