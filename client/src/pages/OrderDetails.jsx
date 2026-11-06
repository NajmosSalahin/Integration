import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MetaTags from '../components/MetaTags';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { getOrder } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Spinner from '../components/ui/Spinner';
import OrderItemsTotal from '../components/order/OrderItemsTotal';
import OrderContactButtons from '../components/order/OrderContactButtons';
import OrderStep from '../components/order/OrderStep';
import { paymentLabel } from '../lib/paymentMethods';
import { orderStatusBadge, orderStatusLabel } from '../lib/orderStatus';
import { orderErrorMessage } from '../lib/orderErrors';

export default function OrderDetails() {
  const { id } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    staleTime: Infinity,
  });

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
  const badge = orderStatusBadge(order.status);
  const sectionHeading = {
    className: 'text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-3',
    style: { fontFamily: "'Bebas Neue', sans-serif" },
  };

  return (
    <>
      <MetaTags title={`Order #${orderShort}`} description="Your order details and status." path={`/order/${id}`} noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              My Orders
            </Link>

            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
              <h1
                className="text-3xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Order Details
              </h1>
              <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded-lg ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-[var(--text-primary)] font-mono text-sm">#{orderShort}</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-6 space-y-6">
              <OrderItemsTotal order={order} />

              <section>
                <h2 {...sectionHeading}>Payment</h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">Method</span>
                    <span className="text-[var(--text-primary)]">{paymentLabel(order.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">Status</span>
                    <span className="text-[var(--text-primary)]">{badge.label}</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 {...sectionHeading}>Delivery</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2 items-start">
                    <MapPin size={14} className="mt-0.5 text-[var(--text-secondary)] shrink-0" aria-hidden="true" />
                    <span className="text-[var(--text-primary)]">{order.deliveryAddress}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Phone size={14} className="text-[var(--text-secondary)] shrink-0" aria-hidden="true" />
                    <span className="text-[var(--text-primary)]">{order.contactPhone}</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 {...sectionHeading}>Order Timeline</h2>
                <ol className="space-y-3 border-l border-[var(--border)] ml-1 pl-4">
                  {order.statusHistory?.length > 0 ? (
                    order.statusHistory.map((entry, index) => {
                      const isLatest = index === order.statusHistory.length - 1;
                      return (
                        <li key={`${entry.status}-${entry.changedAt}-${index}`} className="relative">
                          <span
                            className={`absolute -left-[20px] top-1.5 h-2 w-2 rounded-full ${
                              isLatest ? 'bg-[var(--accent)]' : 'bg-[var(--text-secondary)]'
                            }`}
                            aria-hidden="true"
                          />
                          <p className="text-sm text-[var(--text-primary)]">{orderStatusLabel(entry.status)}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {new Date(entry.changedAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </li>
                      );
                    })
                  ) : (
                    <li className="relative">
                      <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                      <p className="text-sm text-[var(--text-primary)]">{orderStatusLabel(order.status)}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(order.updatedAt || order.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </li>
                  )}
                </ol>
              </section>

              <section>
                <h2 {...sectionHeading}>What Happens Next</h2>
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
                <h2 {...sectionHeading}>Contact Us</h2>
                <OrderContactButtons order={order} />
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}