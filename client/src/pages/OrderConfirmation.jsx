import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MetaTags from '../components/MetaTags';
import { CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { getOrder } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Spinner from '../components/ui/Spinner';
import { paymentLabel } from '../lib/paymentMethods';
import { orderErrorMessage } from '../lib/orderErrors';
import OrderItemsTotal from '../components/order/OrderItemsTotal';
import OrderContactButtons from '../components/order/OrderContactButtons';
import OrderStep from '../components/order/OrderStep';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const passedOrder = location.state?.order;
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    initialData: passedOrder,
    staleTime: Infinity,
  });

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(orderShort);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <div className="flex items-center justify-center py-32" aria-label="Loading order details">
          <Spinner size={32} className="text-[var(--accent)]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4" role="alert">
          <p className="text-red-400">{orderErrorMessage(error)}</p>
          <div className="flex gap-4">
            <Link
              to="/orders"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              My Orders
            </Link>
            <Link
              to="/"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to collection
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const orderShort = String(order._id).slice(-8).toUpperCase();

  return (
    <>
      <MetaTags
        title="Order Confirmed"
        description="Your order has been placed successfully."
        path={`/order-confirmation/${id}`}
        noindex
      />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl mx-auto text-center">
            <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" aria-hidden="true" />
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Order Placed!
            </h1>
            <p className="text-[var(--text-secondary)] mb-1">Order ID:</p>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-[var(--text-primary)] font-mono text-sm">#{orderShort}</span>
              <button
                onClick={handleCopyOrder}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={copied ? 'Copied' : 'Copy order ID'}
              >
                <Copy size={14} aria-hidden="true" />
              </button>
              {copied && (
                <span className="text-xs text-emerald-500" aria-live="polite">
                  Copied!
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-8">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <div className="text-left border border-[var(--border)] rounded-lg p-6 space-y-6">
              <OrderItemsTotal order={order} />

              <section>
                <h2
                  className="text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  What Happens Next
                </h2>
                <div className="space-y-3">
                  {order.paymentMethod === 'cod' ? (
                    <>
                      <OrderStep num="1">We'll contact you shortly to confirm your order details.</OrderStep>
                      <OrderStep num="2">Your order ships within 2–3 business days after confirmation.</OrderStep>
                      <OrderStep num="3">
                        Pay <strong>cash on delivery</strong> when your order arrives. No advance payment required.
                      </OrderStep>
                    </>
                  ) : (
                    <>
                      <OrderStep num="1">We'll contact you shortly to confirm your order details.</OrderStep>
                      <OrderStep num="2">
                        Send your payment via <strong>{paymentLabel(order.paymentMethod)}</strong> to the number we
                        provide.
                      </OrderStep>
                      <OrderStep num="3">Once payment is confirmed, your order ships within 2–3 business days.</OrderStep>
                    </>
                  )}
                </div>
              </section>

              <section>
                <h2
                  className="text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Contact Us
                </h2>
                <OrderContactButtons order={order} />
              </section>
            </div>

            <Link
              to="/"
              className="inline-block mt-8 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to Collection
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}