import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import useCart from '../stores/cartStore';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const total = getTotal();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Checkout — Integration</title>
        </Helmet>
        <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex flex-col items-center justify-center gap-4">
          <p className="text-gray-400">Your cart is empty</p>
          <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Browse the collection
          </Link>
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

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
        <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="tracking-wider uppercase">Back to Cart</span>
            </Link>
            <Link
              to="/"
              className="text-lg tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              INTEGRATION
            </Link>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-8"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
                <div className="space-y-4">
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-sm text-sm text-gray-500 cursor-not-allowed"
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-sm text-sm text-gray-500 cursor-not-allowed"
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    />
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
                  className={`
                    w-full py-3 rounded-sm text-sm tracking-[0.2em] uppercase transition-all duration-200
                    ${submitting || !phone.trim() || !address.trim()
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                    }
                  `}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>

              <div className="lg:col-span-2">
                <div className="sticky top-8 border border-gray-800 rounded-sm p-6 space-y-4">
                  <h2
                    className="text-lg tracking-[0.15em] uppercase"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    Order Summary
                  </h2>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                        <div className="shrink-0 w-12 h-14 bg-gray-900 rounded-sm overflow-hidden">
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

                  <div className="border-t border-gray-800 pt-4">
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
                    Payment is manual via bKash. You will be contacted after placing your order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
