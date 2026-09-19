import { useState } from 'react';
import MetaTags from '../../components/MetaTags';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import { paymentLabel } from '../../lib/paymentMethods';

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS = {
  pending_payment: 'text-yellow-400',
  awaiting_confirmation: 'text-orange-400',
  paid: 'text-[var(--accent)]',
  fulfilled: 'text-emerald-400',
  cancelled: 'text-red-400',
};

const PAYMENT_BADGES = {
  bkash: 'bg-[var(--accent)]/10 text-[var(--accent)]',
  nagad: 'bg-pink-500/10 text-pink-400',
  rocket: 'bg-purple-500/10 text-purple-400',
  cod: 'bg-orange-500/10 text-orange-400',
};

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_payment', label: 'Pending' },
  { value: 'awaiting_confirmation', label: 'Awaiting' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Orders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pendingStatus, setPendingStatus] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminOrders', filter, search, sort, page],
    queryFn: () => getAllOrders({ status: filter || undefined, page, search: search || undefined, sort }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onMutate: ({ orderId }) => setPendingStatus(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setPendingStatus(null);
    },
    onError: () => setPendingStatus(null),
  });

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ orderId, status: newStatus });
  };

  const totalPages = data?.totalPages || 1;

  return (
    <>
      <MetaTags title="Admin Orders" description="Admin dashboard — order management." path="/admin/orders" noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Admin — Orders
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search by ID or customer name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Search orders"
                  className="w-full pl-9 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                aria-label="Sort orders"
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="total_desc">Total: high to low</option>
                <option value="total_asc">Total: low to high</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter orders by status">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setFilter(tab.value);
                    setPage(1);
                  }}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Date', 'Status'].map((h) => (
                        <th
                          key={h}
                          className={`text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal ${
                            ['Items', 'Payment', 'Date'].includes(h) ? 'hidden md:table-cell' : ''
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50">
                        <td className="py-3 px-3"><Skeleton className="w-20 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-24 h-4" /></td>
                        <td className="py-3 px-3 hidden md:table-cell"><Skeleton className="w-40 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4 ml-auto" /></td>
                        <td className="py-3 px-3 hidden md:table-cell"><Skeleton className="w-12 h-4" /></td>
                        <td className="py-3 px-3 hidden md:table-cell"><Skeleton className="w-14 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-20 h-6" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {error && <ErrorState message={error.message} onRetry={refetch} />}

            {data && data.orders.length === 0 && (
              <EmptyState
                title={search ? 'No orders match your search' : 'No orders found'}
                action={
                  search ? (
                    <button onClick={() => setSearch('')} className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
                      Clear search
                    </button>
                  ) : null
                }
              />
            )}

            {data && data.orders.length > 0 && (
              <>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  {data.totalOrders} order{data.totalOrders !== 1 ? 's' : ''}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Admin orders">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Order</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Customer</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden sm:table-cell">Items</th>
                        <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Total</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden md:table-cell">Payment</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden md:table-cell">Date</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => (
                        <tr key={order._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-secondary)]">
                          <td className="py-3 px-3">
                            <span className="text-[var(--text-primary)] font-mono">
                              #{String(order._id).slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div>
                              <p className="text-[var(--text-primary)]">{order.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{order.userId?.email || ''}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 hidden sm:table-cell">
                            <p className="text-[var(--text-secondary)] truncate max-w-[200px]">
                              {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[var(--text-primary)]">
                              ৳{order.totalAmount.toLocaleString()}
                              {order.discountAmount > 0 && (
                                <span className="block text-[10px] text-emerald-500 mt-0.5">
                                  -৳{order.discountAmount.toLocaleString()} {order.couponCode}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-lg ${
                              PAYMENT_BADGES[order.paymentMethod] || 'bg-[var(--accent)]/10 text-[var(--accent)]'
                            }`}>
                              {paymentLabel(order.paymentMethod)}
                            </span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className="text-[var(--text-secondary)] text-xs">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="relative inline-flex items-center gap-1">
                              {pendingStatus === order._id && (
                                <Spinner size={12} className="shrink-0" />
                              )}
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                disabled={pendingStatus === order._id}
                                aria-label={`Status for order #${String(order._id).slice(-8).toUpperCase()}`}
                                className={`bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 text-xs cursor-pointer focus:border-[var(--accent)] focus:outline-none disabled:opacity-50 ${STATUS_COLORS[order.status] || 'text-[var(--text-secondary)]'}`}
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination current={page} total={totalPages} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}