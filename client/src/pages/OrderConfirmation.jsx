import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { CheckCircle } from 'lucide-react';
import { getOrder } from '../api/orders';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const passedOrder = location.state?.order;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    initialData: passedOrder,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse text-[var(--text-secondary)]">Loading order...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-red-400">Order not found</p>
          <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
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
            <CheckCircle size={56} className="mx-auto text-green-500 mb-4" />
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Order Placed!
            </h1>
            <p className="text-gray-400 mb-1">
              Order ID: <span className="text-white">#{orderShort}</span>
            </p>
            <p className="text-xs text-gray-600 mb-8">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <div className="text-left border border-gray-800 rounded-sm p-6 space-y-6">
              <div>
                <h2
                  className="text-sm tracking-[0.15em] uppercase text-gray-400 mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Items
                </h2>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.title} <span className="text-gray-500">({item.size})</span> &times; {item.quantity}
                      </span>
                      <span className="text-gray-300">
                        ৳{(item.priceAtOrder * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-lg text-blue-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    ৳{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h2
                  className="text-sm tracking-[0.15em] uppercase text-gray-400 mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  What Happens Next
                </h2>
                <div className="space-y-3">
                  {order.paymentMethod === 'cod' ? (
                    <>
                      <div className="flex gap-3 items-start">
                        <span className="text-blue-400 font-bold shrink-0">1.</span>
                        <p className="text-sm text-gray-300">We'll contact you shortly to confirm your order details.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="text-blue-400 font-bold shrink-0">2.</span>
                        <p className="text-sm text-gray-300">Your order ships within 2-3 business days after confirmation.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="text-blue-400 font-bold shrink-0">3.</span>
                        <p className="text-sm text-gray-300">Pay <strong>cash on delivery</strong> when your order arrives. No advance payment required.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3 items-start">
                        <span className="text-blue-400 font-bold shrink-0">1.</span>
                        <p className="text-sm text-gray-300">We'll contact you shortly to confirm your order details.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="text-blue-400 font-bold shrink-0">2.</span>
                        <p className="text-sm text-gray-300">Send your payment via <strong>bKash</strong> to the number we provide.</p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="text-blue-400 font-bold shrink-0">3.</span>
                        <p className="text-sm text-gray-300">Once payment is confirmed, your order ships within 2-3 business days.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2
                  className="text-sm tracking-[0.15em] uppercase text-gray-400 mb-3"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  Contact Us
                </h2>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I placed order #${orderShort} on Integration. Total: ৳${order.totalAmount.toLocaleString()}. Looking forward to hearing from you.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-sm transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://m.me/${messengerPage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-sm transition-colors"
                  >
                    Messenger
                  </a>
                  <a
                    href="mailto:najmussalahin.adib@gmail.com"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-sm transition-colors"
                  >
                    Email
                  </a>
                </div>
              </div>
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
