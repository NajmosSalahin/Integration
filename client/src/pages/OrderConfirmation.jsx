import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Copy, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { getOrder } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Spinner from '../components/ui/Spinner';

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
          <p className="text-red-400">Order not found</p>
          <Link
            to="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Back to collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const whatsappNumber = '01604524084';
  const messengerPage = '61594204353841';
  const orderShort = String(order._id).slice(-8).toUpperCase();

  return (
    <>
      <Helmet>
        <title>Order Confirmed — Integration</title>
        <meta name="description" content="Your order has been placed successfully." />
      </Helmet>

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
              <section>
                <h2
                  className="text-sm tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Items
                </h2>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.title} <span className="text-[var(--text-secondary)]">({item.size})</span> &times;{' '}
                        {item.quantity}
                      </span>
                      <span className="text-[var(--text-primary)]">
                        ৳{(item.priceAtOrder * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] mt-3 pt-3 flex justify-between">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-lg text-[var(--accent)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    ৳{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </section>

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
                      <Step num="1">We'll contact you shortly to confirm your order details.</Step>
                      <Step num="2">Your order ships within 2–3 business days after confirmation.</Step>
                      <Step num="3">
                        Pay <strong>cash on delivery</strong> when your order arrives. No advance payment required.
                      </Step>
                    </>
                  ) : (
                    <>
                      <Step num="1">We'll contact you shortly to confirm your order details.</Step>
                      <Step num="2">
                        Send your payment via <strong>bKash</strong> to the number we provide.
                      </Step>
                      <Step num="3">Once payment is confirmed, your order ships within 2–3 business days.</Step>
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
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hi, I placed order #${orderShort} on Integration. Total: ৳${order.totalAmount.toLocaleString()}. Looking forward to hearing from you.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <MessageCircle size={14} aria-hidden="true" />
                    WhatsApp
                  </a>
                  <a
                    href={`https://m.me/${messengerPage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
                  >
                    Messenger
                  </a>
                  <a
                    href="mailto:najmussalahin.adib@gmail.com"
                    className="px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-primary)] text-sm rounded-lg transition-colors"
                  >
                    Email
                  </a>
                </div>
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

function Step({ num, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="text-[var(--accent)] font-bold shrink-0">{num}.</span>
      <p className="text-sm text-[var(--text-primary)]">{children}</p>
    </div>
  );
}