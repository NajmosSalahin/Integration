import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, X, Check, Trash2, ShoppingBag } from 'lucide-react';
import useCart from '../stores/cartStore';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MAX_QTY = 10;
const CONFIRM_MS = 2000;

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { user } = useAuth();
  const total = getTotal();
  const [confirmingRemove, setConfirmingRemove] = useState(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const timers = useRef({});

  const armConfirm = (key) => {
    setConfirmingRemove(key);
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      setConfirmingRemove((current) => (current === key ? null : current));
    }, CONFIRM_MS);
  };

  useEffect(() => {
    const snapshot = timers.current;
    return () => Object.values(snapshot).forEach(clearTimeout);
  }, []);

  const handleRemove = (item) => {
    const key = `${item.productId}-${item.size}`;
    if (confirmingRemove === key) {
      clearTimeout(timers.current[key]);
      setConfirmingRemove(null);
      removeItem(item.productId, item.size);
    } else {
      armConfirm(key);
    }
  };

  const handleClear = () => {
    if (confirmingClear) {
      setConfirmingClear(false);
      clearCart();
    } else {
      setConfirmingClear(true);
      setTimeout(() => setConfirmingClear(false), CONFIRM_MS);
    }
  };

  const removeButtonClass = (item) => {
    const key = `${item.productId}-${item.size}`;
    const isArmed = confirmingRemove === key;
    return `p-2 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center relative ${
      isArmed ? 'text-red-400 bg-red-500/10' : 'text-[var(--text-secondary)] hover:text-red-400'
    }`;
  };

  const clearClass = confirmingClear
    ? 'w-full py-2.5 text-xs tracking-wider uppercase text-red-400'
    : 'w-full py-2.5 text-xs tracking-wider uppercase text-[var(--text-secondary)] hover:text-red-400 transition-colors';

  const handleQtyChange = (item, value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    if (n < 1) {
      removeItem(item.productId, item.size);
      return;
    }
    updateQuantity(item.productId, item.size, Math.min(MAX_QTY, n));
  };

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
                <ShoppingBag size={48} className="mx-auto text-[var(--border)] mb-4" aria-hidden="true" />
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
                  {items.map((item) => {
                    const key = `${item.productId}-${item.size}`;
                    const armedRemove = confirmingRemove === key;
                    return (
                      <div
                        key={key}
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
                              onClick={() => handleRemove(item)}
                              className={removeButtonClass(item)}
                              aria-label={
                                armedRemove
                                  ? `Confirm remove ${item.title}`
                                  : `Remove ${item.title}`
                              }
                              title={armedRemove ? 'Click again to confirm' : 'Remove item'}
                            >
                              {armedRemove ? (
                                <Check size={16} aria-hidden="true" />
                              ) : (
                                <X size={16} aria-hidden="true" />
                              )}
                              {armedRemove && (
                                <span
                                  className="absolute bottom-0 left-0 h-0.5 bg-red-400 animate-[confirm-timer_2s_linear_forwards]"
                                  style={{ width: '100%' }}
                                />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3 gap-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  item.quantity <= 1
                                    ? handleRemove(item)
                                    : updateQuantity(item.productId, item.size, item.quantity - 1)
                                }
                                className="w-11 h-11 flex items-center justify-center border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
                                aria-label={
                                  item.quantity <= 1
                                    ? `Remove ${item.title} from cart`
                                    : 'Decrease quantity'
                                }
                              >
                                {item.quantity <= 1 ? (
                                  <Trash2 size={14} aria-hidden="true" />
                                ) : (
                                  <Minus size={14} aria-hidden="true" />
                                )}
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={MAX_QTY}
                                value={item.quantity}
                                onChange={(e) => handleQtyChange(item, e.target.value)}
                                aria-label={`Quantity of ${item.title} (${item.size})`}
                                className="w-12 h-11 text-center text-sm tabular-nums border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                              />
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                disabled={item.quantity >= MAX_QTY}
                                className="w-11 h-11 flex items-center justify-center border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                <Plus size={14} aria-hidden="true" />
                              </button>
                            </div>
                            <p
                              className="text-sm text-[var(--text-primary)] tabular-nums"
                              aria-live="polite"
                            >
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-3">
                  <div className="flex items-center justify-between" aria-live="polite">
                    <span className="text-sm text-[var(--text-secondary)]">Subtotal</span>
                    <span
                      className="text-xl text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-utility)" }}
                    >
                      ৳{total.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                    <p className="text-xs text-blue-300">
                      Payment is manual via bKash. You will be contacted after placing your order.
                    </p>
                  </div>

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

                  {!user && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      Sign in to track your order after checkout.
                    </p>
                  )}

                  <button onClick={handleClear} className={clearClass}>
                    {confirmingClear ? 'Confirm Clear Cart?' : 'Clear Cart'}
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