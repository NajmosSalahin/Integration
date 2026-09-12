import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import useCart from '../stores/cartStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const total = getTotal();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Checkout — Integration</title>
        </Helmet>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <Navbar />
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-[var(--text-secondary)]">Your cart is empty</p>
            <Link to="/" className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
              Browse the collection
            </Link>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
        deliveryAddress: address,
        contactPhone: phone,
        paymentMethod,
      };

      const order = await createOrder(orderData);
      clearCart();
      navigate(`/order-confirmation/${order._id}`, { state: { order } });
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout — Integration</title>
        <meta name="description" content="Complete your order." />
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-5"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
                <div className="space-y-3">
                  <h2
                    className="text-lg tracking-[0.15em] uppercase"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    Delivery Details
                  </h2>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+8801XXXXXXXXX"
                      className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                      placeholder="Full delivery address including area and landmark"
                      className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">
                      Payment Method *
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={`flex-1 py-3 px-4 rounded-lg border text-sm tracking-wider uppercase transition-all duration-200 ${
                          paymentMethod === 'bkash'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                        }`}
                      >
                        bKash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`flex-1 py-3 px-4 rounded-lg border text-sm tracking-wider uppercase transition-all duration-200 ${
                          paymentMethod === 'cod'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                        }`}
                      >
                        Cash on Delivery
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-sm text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !phone.trim() || !address.trim()}
                                      className={`w-full py-2.5 rounded-lg text-sm tracking-[0.2em] uppercase transition-all duration-200 ${submitting || !phone.trim() || !address.trim()
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                    }
                  `}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>

              <div className="lg:col-span-2">
                <div className="sticky top-8 border border-gray-800 rounded-sm p-4 space-y-3">
                  <h2
                    className="text-lg tracking-[0.15em] uppercase"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    Order Summary
                  </h2>

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                        <div className="shrink-0 w-12 h-12 bg-gray-900 rounded-sm overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm tracking-[0.1em] uppercase truncate"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.size} &times; {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-gray-300 shrink-0">
                          ৳{((item.price * item.quantity) / 100).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total</span>
                      <span
                        className="text-xl text-blue-400"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        ৳{(total / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">
                    {paymentMethod === 'cod'
                      ? 'Pay when your order arrives. No advance payment required.'
                      : 'Pay instantly via bKash for faster delivery. You will be contacted after placing your order.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
