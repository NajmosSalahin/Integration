import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Shirt } from 'lucide-react';
import { getMyOrders } from '../../api/orders';
import { fetchProducts } from '../../api/products';
import { cloudinaryUrl } from '../../lib/image';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';

const STATUS_BADGES = {
  pending_payment: { label: 'Processing', cls: 'bg-yellow-500/10 text-yellow-400' },
  awaiting_confirmation: { label: 'Processing', cls: 'bg-yellow-500/10 text-yellow-400' },
  paid: { label: 'Processing', cls: 'bg-yellow-500/10 text-yellow-400' },
  shipped: { label: 'Shipped', cls: 'bg-[var(--accent)]/10 text-[var(--accent)]' },
  fulfilled: { label: 'Delivered', cls: 'bg-emerald-500/10 text-emerald-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-400' },
};

export default function OrdersSection() {
  const navigate = useNavigate();

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: getMyOrders,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const productById = useMemo(
    () => new Map((products || []).map((p) => [p._id, p])),
    [products]
  );

  return (
    <section aria-label="My orders">
      <div className="flex items-baseline justify-between mb-5">
        <h2
          className="text-2xl sm:text-3xl tracking-[0.15em] uppercase"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          My Orders
        </h2>
        {orders && orders.length > 0 && (
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--border)] rounded-[10px] p-4">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="w-24 h-4 mb-2" />
                  <Skeleton className="w-3/4 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {orders && orders.length === 0 && (
        <EmptyState
          icon={Package}
          title="No orders yet"
          action={
            <Link to="/shop" className="mt-4 inline-block text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
              Browse the collection
            </Link>
          }
        />
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3 max-w-3xl">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const product = firstItem ? productById.get(firstItem.productId) : undefined;
            const badge = STATUS_BADGES[order.status] || { label: order.status, cls: 'text-[var(--text-secondary)]' };

            return (
              <button
                key={order._id}
                onClick={() => navigate(`/order-confirmation/${order._id}`)}
                className="w-full text-left p-4 border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center shrink-0">
                    {product?.images?.[0] ? (
                      <img
                        src={cloudinaryUrl(product.images[0], 128)}
                        alt={product.title}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Shirt size={24} className="text-[var(--text-secondary)]" aria-hidden="true" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-primary)] font-mono">
                        #{String(order._id).slice(-8).toUpperCase()}
                      </p>
                      <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded-lg ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">
                      {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}
                    </p>
                    <p className="mt-2 text-[var(--accent)]" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                      ৳{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}