import { useEffect, useState } from 'react';
import {
  Copy,
  Eye,
  Mail,
  Phone,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaTags from '../../components/MetaTags';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import IconButton from '../../components/admin/IconButton';
import StatusBadge from '../../components/admin/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getAllOrders, getOrder, updateOrderStatus } from '../../api/orders';
import { paymentLabel } from '../../lib/paymentMethods';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TRANSITIONS,
  orderStatusLabel,
  orderStatusTone,
} from '../../lib/orderStatus';
import { formatCurrency, formatDate, formatDateTime, shortId } from '../../lib/format';
import { useToast } from '../../components/ui/Toast';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_payment', label: 'Pending' },
  { value: 'awaiting_confirmation', label: 'Awaiting' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusOptionsFor = (status) => [status, ...(ORDER_STATUS_TRANSITIONS[status] || [])];

const PAYMENT_BADGES = {
  bkash: 'bg-[var(--accent)]/10 text-[var(--accent)]',
  nagad: 'bg-pink-500/10 text-pink-400',
  rocket: 'bg-purple-500/10 text-purple-400',
  cod: 'bg-orange-500/10 text-orange-400',
};

const selectClass =
  'bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

export default function Orders() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, sort]);

  const { data: detail, isLoading: detailLoading, error: detailError, refetch: refetchDetail } = useQuery({
    queryKey: ['adminOrder', detailId],
    queryFn: () => getOrder(detailId),
    enabled: Boolean(detailId),
    retry: false,
  });

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['adminOrders', filter, debouncedSearch, sort, page],
    queryFn: () =>
      getAllOrders({
        status: filter || undefined,
        page,
        search: debouncedSearch || undefined,
        sort,
      }),
    placeholderData: (previous) => previous,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onMutate: ({ orderId, status }) => {
      const previous = queryClient.getQueriesData({ queryKey: ['adminOrders'] });
      const previousDetail = queryClient.getQueryData(['adminOrder', orderId]);
      queryClient.setQueriesData({ queryKey: ['adminOrders'] }, (old) => {
        if (!old || !Array.isArray(old.orders)) return old;
        return {
          ...old,
          orders: old.orders.map((o) => (o._id === orderId ? { ...o, status } : o)),
        };
      });
      queryClient.setQueryData(['adminOrder', orderId], (old) =>
        old ? { ...old, status } : old
      );
      return { previous, previousDetail };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminOrder', updated._id], updated);
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast({ type: 'success', message: `Status updated — ${orderStatusLabel(updated.status)}` });
    },
    onError: (err, { orderId }, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, value]) => queryClient.setQueryData(key, value));
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(['adminOrder', orderId], context.previousDetail);
      }
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast({ type: 'error', message: err.message || 'Failed to update order status.' });
    },
  });

  const handleStatusChange = (order, newStatus) => {
    if (!order || newStatus === order.status) return;
    if (newStatus === 'fulfilled' || newStatus === 'cancelled') {
      setConfirmStatus({ order, status: newStatus });
      return;
    }
    statusMutation.mutate({ orderId: order._id, status: newStatus });
  };

  const confirmTerminalStatus = () => {
    if (!confirmStatus) return;
    statusMutation.mutate({ orderId: confirmStatus.order._id, status: confirmStatus.status });
    setConfirmStatus(null);
  };

  const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast({ type: 'success', message: `${label} copied.` });
    } catch {
      toast({ type: 'error', message: 'Could not copy to clipboard.' });
    }
  };

  const counts = data?.statusCounts || {};
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const totalPages = data?.totalPages || 1;
  const hasFilters = Boolean(search || filter);
  const clearFilters = () => {
    setSearch('');
    setFilter('');
    setPage(1);
  };

  const rowPending = (orderId) =>
    statusMutation.isPending && statusMutation.variables?.orderId === orderId;

  return (
    <>
      <MetaTags
        title="Admin Orders"
        description="Admin dashboard — order management."
        path="/admin/orders"
        noindex
      />

      <AdminPageHeader
        title="Orders"
        description="Review payments, update fulfilment status, and contact customers."
      />

      <AdminToolbar
        query={search}
        onQueryChange={setSearch}
        searchPlaceholder="Search by order ID, customer name, or email..."
        searchLabel="Search orders"
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'date_desc', label: 'Newest first' },
          { value: 'date_asc', label: 'Oldest first' },
          { value: 'total_desc', label: 'Total: high to low' },
          { value: 'total_asc', label: 'Total: low to high' },
        ]}
        total={data?.totalOrders ?? 0}
        totalLabel="order"
      >
        {isFetching && data && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Spinner size={12} />
            Updating
          </span>
        )}
      </AdminToolbar>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="group" aria-label="Filter orders by status">
        {FILTER_TABS.map((tab) => {
          const count = tab.value ? counts[tab.value] : allCount;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              aria-pressed={filter === tab.value}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                filter === tab.value
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
              {data && (
                <span className="ml-1.5 text-[10px] opacity-70" aria-hidden="true">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading && !data && (
        <div className="overflow-x-auto" aria-busy="true">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Date', 'Status'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal ${
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
                  <td className="px-3 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="hidden px-3 py-3 md:table-cell"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-3 py-3"><Skeleton className="ml-auto h-4 w-16" /></td>
                  <td className="hidden px-3 py-3 md:table-cell"><Skeleton className="h-4 w-12" /></td>
                  <td className="hidden px-3 py-3 md:table-cell"><Skeleton className="h-4 w-14" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-6 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <ErrorState message={error.message} onRetry={refetch} />}

      {data && data.orders.length === 0 && (
        <EmptyState
          message={hasFilters ? 'No orders match your filters' : 'No orders found'}
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400"
              >
                Clear filters
              </button>
            ) : null
          }
        />
      )}

      {data && data.orders.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
            <table className="w-full text-sm" aria-label="Admin orders">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Order</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Customer</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Items</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)]">Total</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Payment</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => {
                  const pending = rowPending(order._id);
                  return (
                    <tr
                      key={order._id}
                      onClick={() => setDetailId(order._id)}
                      className="cursor-pointer border-b border-[var(--border)]/50 transition-colors last:border-0 hover:bg-[var(--bg-secondary)]"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailId(order._id);
                          }}
                          className="font-mono text-xs text-[var(--text-primary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                          aria-label={`View order ${shortId(order._id)}`}
                        >
                          #{shortId(order._id)}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[var(--text-primary)]">{order.userId?.name || 'Unknown'}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{order.userId?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[220px] truncate text-xs text-[var(--text-secondary)]">
                          {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[var(--text-primary)]">{formatCurrency(order.totalAmount)}</span>
                        {order.discountAmount > 0 && (
                          <span className="mt-0.5 block text-[10px] text-emerald-500">
                            -{formatCurrency(order.discountAmount)} {order.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-lg px-2 py-0.5 text-xs ${PAYMENT_BADGES[order.paymentMethod] || 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                          {paymentLabel(order.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={orderStatusTone(order.status)}>
                          {orderStatusLabel(order.status)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={pending || statusOptionsFor(order.status).length === 1}
                            aria-label={`Change status for order ${shortId(order._id)}`}
                            className={selectClass}
                          >
                            {statusOptionsFor(order.status).map((value) => (
                              <option key={value} value={value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                                {ORDER_STATUS_LABELS[value] || value}
                                {value === order.status ? ' (current)' : ''}
                              </option>
                            ))}
                          </select>
                          {pending ? (
                            <span className="inline-flex h-9 w-9 items-center justify-center">
                              <Spinner size={14} />
                            </span>
                          ) : (
                            <IconButton
                              label={`View order ${shortId(order._id)}`}
                              tone="accent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailId(order._id);
                              }}
                            >
                              <Eye size={16} aria-hidden="true" />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {data.orders.map((order) => {
              const pending = rowPending(order._id);
              return (
                <div
                  key={order._id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailId(order._id)}
                      className="font-mono text-xs text-[var(--text-primary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                    >
                      #{shortId(order._id)}
                    </button>
                    <StatusBadge tone={orderStatusTone(order.status)}>
                      {orderStatusLabel(order.status)}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-[var(--text-primary)]">{order.userId?.name || 'Unknown'}</p>
                    <p className="truncate text-xs text-[var(--text-secondary)]">{order.userId?.email || ''}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{paymentLabel(order.paymentMethod)}</span>
                    <span className="text-[var(--text-primary)]">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      disabled={pending || statusOptionsFor(order.status).length === 1}
                      aria-label={`Change status for order ${shortId(order._id)}`}
                      className={`${selectClass} flex-1`}
                    >
                      {statusOptionsFor(order.status).map((value) => (
                        <option key={value} value={value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                          {ORDER_STATUS_LABELS[value] || value}
                          {value === order.status ? ' (current)' : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setDetailId(order._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {pending ? <Spinner size={12} /> : <Eye size={14} aria-hidden="true" />}
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination current={page} total={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}

      <Modal
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        maxWidth="max-w-3xl"
        title={`Order #${shortId(detailId)}`}
        footer={
          detail ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(detailId, 'Order ID')}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <Copy size={14} aria-hidden="true" />
                  Copy order ID
                </button>
                <button
                  type="button"
                  onClick={() => copyText(detail.userId?.email || '', 'Email')}
                  disabled={!detail.userId?.email}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Mail size={14} aria-hidden="true" />
                  Copy email
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={detail.status}
                  onChange={(e) => handleStatusChange(detail, e.target.value)}
                  disabled={
                    rowPending(detail._id) ||
                    statusOptionsFor(detail.status).length === 1
                  }
                  aria-label="Update order status"
                  className={`${selectClass} flex-1 sm:flex-none`}
                >
                  {statusOptionsFor(detail.status).map((value) => (
                    <option key={value} value={value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                      {ORDER_STATUS_LABELS[value] || value}
                      {value === detail.status ? ' (current)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setDetailId(null)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {detailLoading && (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {detailError && <ErrorState message={detailError.message} onRetry={refetchDetail} />}

        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={orderStatusTone(detail.status)}>
                {orderStatusLabel(detail.status)}
              </StatusBadge>
              <span className={`rounded-lg px-2 py-0.5 text-xs ${PAYMENT_BADGES[detail.paymentMethod] || 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                {paymentLabel(detail.paymentMethod)}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {formatDateTime(detail.createdAt)}
              </span>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Order ID</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="break-all text-xs text-[var(--text-primary)]">{detail._id}</code>
                <IconButton label="Copy order ID" onClick={() => copyText(detail._id, 'Order ID')}>
                  <Copy size={14} aria-hidden="true" />
                </IconButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Customer</p>
                <p className="text-[var(--text-primary)]">{detail.userId?.name || 'Unknown'}</p>
                {detail.userId?.email && (
                  <a
                    href={`mailto:${detail.userId.email}`}
                    className="flex items-center gap-1.5 break-all text-xs text-[var(--accent)] hover:underline"
                  >
                    <Mail size={13} aria-hidden="true" />
                    {detail.userId.email}
                  </a>
                )}
                {detail.contactPhone && (
                  <a
                    href={`tel:${detail.contactPhone}`}
                    className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
                  >
                    <Phone size={13} aria-hidden="true" />
                    {detail.contactPhone}
                  </a>
                )}
              </div>
              <div className="space-y-1 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Delivery address</p>
                <p className="whitespace-pre-line leading-relaxed text-[var(--text-primary)]">{detail.deliveryAddress}</p>
              </div>
            </div>

            {detail.paymentNote && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                <p className="mb-1 text-xs uppercase tracking-wider text-[var(--text-secondary)]">Payment note</p>
                <p className="whitespace-pre-line leading-relaxed text-[var(--text-primary)]">{detail.paymentNote}</p>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-sm" aria-label="Order items">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th scope="col" className="px-3 py-2 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Item</th>
                    <th scope="col" className="px-3 py-2 text-center text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Size</th>
                    <th scope="col" className="px-3 py-2 text-center text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Qty</th>
                    <th scope="col" className="px-3 py-2 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item, i) => (
                    <tr key={i} className="border-b border-[var(--border)]/50 last:border-0">
                      <td className="px-3 py-2 text-[var(--text-primary)]">{item.title}</td>
                      <td className="px-3 py-2 text-center text-[var(--text-secondary)]">{item.size}</td>
                      <td className="px-3 py-2 text-center text-[var(--text-secondary)]">x{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-[var(--text-primary)]">{formatCurrency(item.priceAtOrder)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto w-full space-y-1 text-sm sm:w-64">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatCurrency(detail.items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0))}</span>
              </div>
              {detail.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon {detail.couponCode}</span>
                  <span>-{formatCurrency(detail.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--border)] pt-1 font-medium text-[var(--text-primary)]">
                <span>Total</span>
                <span>{formatCurrency(detail.totalAmount)}</span>
              </div>
            </div>

            {detail.statusHistory?.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
                <p className="mb-2 text-xs uppercase tracking-wider text-[var(--text-secondary)]">Status history</p>
                <ol className="space-y-2">
                  {detail.statusHistory.map((entry, index) => (
                    <li
                      key={`${entry.status}-${entry.changedAt}-${index}`}
                      className="flex items-start justify-between gap-3 text-xs"
                    >
                      <span className="text-[var(--text-primary)]">{orderStatusLabel(entry.status)}</span>
                      <span className="text-right text-[var(--text-secondary)]">
                        {formatDateTime(entry.changedAt)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmStatus)}
        onClose={() => setConfirmStatus(null)}
        onConfirm={confirmTerminalStatus}
        title={
          confirmStatus?.status === 'cancelled'
            ? 'Cancel this order?'
            : 'Mark this order as fulfilled?'
        }
        message={
          confirmStatus?.status === 'cancelled'
            ? `Order #${shortId(confirmStatus?.order?._id)} will be cancelled and cannot be reopened.`
            : `Order #${shortId(confirmStatus?.order?._id)} will be marked fulfilled. This status is final.`
        }
        confirmLabel={confirmStatus?.status === 'cancelled' ? 'Cancel order' : 'Mark fulfilled'}
        danger={confirmStatus?.status === 'cancelled'}
        loading={statusMutation.isPending}
      />
    </>
  );
}
