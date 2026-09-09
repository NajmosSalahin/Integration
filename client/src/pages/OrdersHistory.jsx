import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Package } from 'lucide-react';
import { getMyOrders } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  awaiting_confirmation: 'Awaiting Confirmation',
  paid: 'Paid',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

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

export default function OrdersHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['myOrders'],
    queryFn: getMyOrders,
  });

  const filtered = filter
    ? orders?.filter((o) => o.status === filter)
    : orders;

  return (
    <>
      <Helmet>
        <title>My Orders — Integration</title>
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-4xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              My Orders
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

            {filtered && filtered.length === 0 && (
              <div className="text-center py-20">
                <Package size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 mb-2">No orders found</p>
                <Link
                  to="/"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Browse the collection
                </Link>
              </div>
            )}

            {filtered && filtered.length > 0 && (
              <div className="space-y-4">
                {filtered.map((order) => (
                  <button
                    key={order._id}
                    onClick={() => navigate(`/order-confirmation/${order._id}`)}
                    className="w-full text-left p-4 border border-gray-800 rounded-sm hover:bg-gray-900/30 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm text-gray-300">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className={`text-xs ${STATUS_COLORS[order.status] || 'text-gray-400'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-400 mb-2">
                      {order.items.map((i) => `${i.title} (${i.size}) x${i.quantity}`).join(', ')}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span
                        className="text-blue-400"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        ৳{(order.totalAmount / 100).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
