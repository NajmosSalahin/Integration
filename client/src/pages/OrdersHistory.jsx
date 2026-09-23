import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MetaTags from '../components/MetaTags';
import { Package, Shirt } from 'lucide-react';
import { getMyOrders } from '../api/orders';
import { fetchProducts } from '../api/products';
import { cloudinaryUrl } from '../lib/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  awaiting_confirmation: 'Awaiting Confirmation',
  paid: 'Paid',
  shipped: 'Shipped',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  pending_payment: 'text-yellow-400',
  awaiting_confirmation: 'text-orange-400',
  paid: 'text-[var(--accent)]',
  shipped: 'text-sky-400',
  fulfilled: 'text-emerald-400',
  cancelled: 'text-red-400',
};

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_payment', label: 'Pending' },
  { value: 'awaiting_confirmation', label: 'Awaiting' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

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

  const filtered = filter ? orders?.filter((o) => o.status === filter) : orders;

  return (
    <>
      <MetaTags title="My Orders" description="View your past orders and order status." path="/orders" noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <h1
                className="text-3xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                My Orders
              </h1>
              {orders && orders.length > 0 && (
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter orders by status">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  aria-pressed={filter === tab.value}
                  className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-lg border transition-colors ${
                    filter === tab.value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-[var(--border)] rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-16 h-4" />
                    </div>
                    <Skeleton className="w-3/4 h-3 mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="w-12 h-3" />
                      <Skeleton className="w-20 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <ErrorState message={error.message} onRetry={refetch} />}

            {filtered && filtered.length === 0 && (
              <EmptyState
                icon={Package}
                title={filter ? 'No matching orders' : 'No orders yet'}
                action={
                  !filter ? (
                    <Link
                      to="/shop"
                      className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
                    >
                      Browse the collection
                    </Link>
                  ) : null
                }
              />
            )}

            {filtered && filtered.length > 0 && (
              <div className="space-y-4" aria-label={`Showing ${filtered.length} order${filtered.length !== 1 ? 's' : ''}`}>
                {filtered.map((order) => {
                  const firstItem = order.items[0];
                  const product = firstItem ? productById.get(firstItem.productId) : undefined;

                  return (
                    <button
                      key={order._id}
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="w-full text-left p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
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
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="text-sm text-[var(--text-primary)] font-mono">
                                #{String(order._id).slice(-8).toUpperCase()}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <span className={`text-xs ${STATUS_COLORS[order.status] || 'text-[var(--text-secondary)]'}`}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </div>

                          <div className="text-sm text-[var(--text-secondary)] mb-2 truncate">
                            {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-[var(--text-secondary)]">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-2">
                              {order.discountAmount > 0 && (
                                <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                  -৳{order.discountAmount.toLocaleString()} {order.couponCode}
                                </span>
                              )}
                              <span className="text-[var(--accent)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                ৳{order.totalAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}