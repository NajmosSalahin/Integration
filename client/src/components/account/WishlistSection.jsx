import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts } from '../../api/products';
import { toggleWishlist } from '../../api/account';
import ShopProductCard from '../ShopProductCard';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';
import { useToast } from '../ui/Toast';

export default function WishlistSection() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const ids = user?.wishlist || [];

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const orderMap = useMemo(() => new Map(ids.map((id, i) => [id, i])), [ids]);

  const saved = useMemo(
    () =>
      (products || [])
        .filter((p) => orderMap.has(p._id))
        .sort((a, b) => orderMap.get(a._id) - orderMap.get(b._id)),
    [products, orderMap]
  );

  const removeMutation = useMutation({
    mutationFn: toggleWishlist,
    onSuccess: async () => {
      toast({ type: 'success', message: 'Removed from saved designs' });
      await refreshUser();
    },
    onError: (err) => toast({ type: 'error', message: err?.message || 'Could not remove item' }),
  });

  const header = (
    <div className="flex items-baseline justify-between mb-5">
      <h2
        className="text-2xl sm:text-3xl tracking-[0.15em] uppercase"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
      >
        Saved Designs
      </h2>
      {saved.length > 0 && (
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {saved.length} saved
        </p>
      )}
    </div>
  );

  return (
    <section aria-label="Saved designs" className="min-h-[300px]">
      {header}

      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square w-full rounded-[10px]" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && saved.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No saved designs yet"
          action={
            <Link to="/shop" className="mt-4 inline-block text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
              Browse the shop
            </Link>
          }
        />
      )}

      {saved.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {saved.map((product, i) => (
            <ShopProductCard
              key={product._id}
              product={product}
              index={i}
              onRemove={(p) => removeMutation.mutate(p._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}