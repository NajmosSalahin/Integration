import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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
  paid: 'text-blue-400',
  fulfilled: 'text-green-400',
  cancelled: 'text-red-400',
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOrders', filter],
    queryFn: () => getAllOrders({ status: filter || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    statusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <>
      <Helmet>
        <title>Admin Orders — Integration</title>
      </Helmet>

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

            <div className="flex flex-wrap gap-2 mb-6">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-sm border transition-colors ${
                    filter === tab.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading && (
              <div className="text-center py-20">
                <div className="animate-pulse text-gray-500">Loading orders...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <p className="text-red-400">Failed to load orders</p>
                <p className="text-sm text-gray-500 mt-2">{error.message}</p>
              </div>
            )}

            {data && data.orders.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400">No orders found</p>
              </div>
            )}

            {data && data.orders.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  {data.totalOrders} order{data.totalOrders !== 1 ? 's' : ''}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Order</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Customer</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal hidden sm:table-cell">Items</th>
                        <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Total</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal hidden md:table-cell">Payment</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal hidden md:table-cell">Date</th>
                        <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => (
                        <tr key={order._id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                          <td className="py-3 px-3">
                            <span className="text-gray-300">
                              #{String(order._id).slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div>
                              <p className="text-gray-300">{order.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-600">{order.userId?.email || ''}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 hidden sm:table-cell">
                            <p className="text-gray-400 truncate max-w-[200px]">
                              {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-gray-300">
                              ৳{order.totalAmount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-sm ${
                              order.paymentMethod === 'cod'
                                ? 'bg-orange-500/10 text-orange-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {order.paymentMethod === 'cod' ? 'COD' : 'bKash'}
                            </span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className="text-gray-500 text-xs">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={statusMutation.isPending}
                              className={`bg-transparent border border-gray-700 rounded-sm px-2 py-1 text-xs cursor-pointer focus:border-blue-500 focus:outline-none ${STATUS_COLORS[order.status] || 'text-gray-400'}`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.totalPages > 1 && (
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-600">
                      Page {data.page} of {data.totalPages}
                    </p>
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
