import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import useCart from '../stores/cartStore';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const total = getTotal();

  return (
    <>
      <Helmet>
        <title>Your Cart — Integration</title>
        <meta name="description" content="Review your cart before checkout." />
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-5"
              style={{ fontFamily: "var(--font-utility)" }}
            >
              Your Cart
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-[var(--text-secondary)] mb-2">Your cart is empty</p>
                <Link
                  to="/"
                  className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
                >
                  Browse the collection
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-4 p-4 border border-[var(--border)] rounded-lg"
                    >
                      <Link
                        to={`/product/${item.productId}`}
                        className="shrink-0 w-24 h-24 bg-[#111] rounded-lg overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-sm tracking-[0.15em] uppercase hover:text-[var(--accent)] transition-colors"
                              style={{ fontFamily: "var(--font-utility)" }}
                            >
                              {item.title}
                            </Link>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              Size: {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove "${item.title}" (${item.size}) from cart?`)) {
                                removeItem(item.productId, item.size);
                              }
                            }}
                            className="p-2 text-[var(--text-secondary)] hover:text-red-400 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label={`Remove ${item.title}`}
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-11 h-11 flex items-center justify-center border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                              className="w-11 h-11 flex items-center justify-center border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-[var(--text-primary)] tabular-nums">
                            ৳{((item.price * item.quantity) / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Subtotal</span>
                    <span
                      className="text-xl text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-utility)" }}
                    >
                      ৳{(total / 100).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    Payment is manual via bKash. You will be contacted after placing your order.
                  </p>

                  {user ? (
                    <Link
                      to="/checkout"
                      className="block w-full py-2.5 rounded-lg text-sm tracking-[0.2em] uppercase bg-[var(--accent)] hover:bg-blue-500 text-white text-center transition-all duration-200"
                    >
                      Checkout
                    </Link>
                  ) : (
                    <Link
                      to="/login?redirect=/checkout"
                      className="block w-full py-2.5 rounded-lg text-sm tracking-[0.2em] uppercase bg-[var(--accent)] hover:bg-blue-500 text-white text-center transition-all duration-200"
                    >
                      Login to Checkout
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Clear all items from cart?')) {
                        clearCart();
                      }
                    }}
                    className="w-full py-2.5 text-xs tracking-wider uppercase text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
