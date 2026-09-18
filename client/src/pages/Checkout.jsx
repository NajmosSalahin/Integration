import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import useCart from '../stores/cartStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormField from '../components/ui/FormField';
import MetaTags from '../components/MetaTags';
import { PAYMENT_METHODS, paymentLabel } from '../lib/paymentMethods';
import { composeAddress, defaultAddress } from '../lib/address';

const PHONE_RE = /^(\+?[\d\s()-]{8,16})$/;
const MIN_ADDRESS_LEN = 10;

const inputClass = (hasError) =>
  `w-full px-3 py-2.5 bg-[var(--bg-secondary)] border rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none transition-colors ${
    hasError
      ? 'border-red-500/60 focus:border-red-500'
      : 'border-[var(--border)] focus:border-[var(--accent)]'
  }`;

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
  const [fieldErrors, setFieldErrors] = useState({ phone: null, address: null });
  const touched = useRef(false);

  useEffect(() => {
    if (!user || touched.current) return;
    const saved = defaultAddress(user);
    if (!phone && (user.phone || saved?.phone)) setPhone(user.phone || saved.phone);
    if (!address && saved) setAddress(composeAddress(saved));
  }, [user]);

  if (items.length === 0) {
    return (
      <>
        <MetaTags title="Checkout" description="Complete your order." path="/checkout" noindex />
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

  const validate = () => {
    const errors = {};
    if (!phone.trim()) errors.phone = 'Phone number is required.';
    else if (!PHONE_RE.test(phone.trim())) errors.phone = 'Enter a valid phone number (e.g. +8801XXXXXXXXX).';
    if (!address.trim()) errors.address = 'Delivery address is required.';
    else if (address.trim().length < MIN_ADDRESS_LEN) errors.address = `Address should be at least ${MIN_ADDRESS_LEN} characters.`;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const paymentButtonClass = (active) =>
    `flex-1 py-3 px-4 rounded-lg border text-sm tracking-wider uppercase transition-all duration-200 ${
      active
        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <>
      <MetaTags title="Checkout" description="Complete your order." path="/checkout" noindex />

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
              <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4" noValidate>
                {error && (
                  <div
                    className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-400 flex items-start gap-2"
                    role="alert"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <h2
                    className="text-lg tracking-[0.15em] uppercase"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    Delivery Details
                  </h2>

                  <FormField label="Name">
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        disabled={submitting}
                        autoComplete="name"
                        aria-readonly="true"
                        className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] cursor-not-allowed"
                      />
                    )}
                  </FormField>

                  <FormField label="Email">
                    {({ id }) => (
                      <input
                        id={id}
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        disabled={submitting}
                        autoComplete="email"
                        aria-readonly="true"
                        className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] cursor-not-allowed"
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Phone Number"
                    required
                    error={fieldErrors.phone}
                    helperText="You will be contacted on this number about payment."
                  >
                    {({ id, ...rest }) => (
                      <input
                        id={id}
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          touched.current = true;
                          setFieldErrors((f) => ({ ...f, phone: null }));
                        }}
                        disabled={submitting}
                        required
                        placeholder="+8801XXXXXXXXX"
                        autoComplete="tel"
                        {...rest}
                        className={inputClass(Boolean(fieldErrors.phone))}
                      />
                    )}
                  </FormField>

                  <FormField
                    label="Delivery Address"
                    required
                    error={fieldErrors.address}
                  >
                    {({ id, ...rest }) => (
                      <textarea
                        id={id}
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          touched.current = true;
                          setFieldErrors((f) => ({ ...f, address: null }));
                        }}
                        disabled={submitting}
                        required
                        rows={3}
                        placeholder="Full delivery address including area and landmark"
                        autoComplete="street-address"
                        {...rest}
                        className={`${inputClass(Boolean(fieldErrors.address))} resize-none`}
                      />
                    )}
                  </FormField>

                  <fieldset>
                    <legend className="block text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
                      Payment Method *
                    </legend>
                    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentMethod(method.value)}
                          disabled={submitting}
                          role="radio"
                          aria-checked={paymentMethod === method.value}
                          className={paymentButtonClass(paymentMethod === method.value)}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !phone.trim() || !address.trim()}
                  aria-busy={submitting}
                  className={`w-full py-2.5 rounded-lg text-sm tracking-[0.2em] uppercase transition-all duration-200 ${
                    submitting || !phone.trim() || !address.trim()
                      ? 'bg-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'
                      : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer'
                  }`}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>

              <aside className="lg:col-span-2" aria-label="Order summary">
                <div className="sticky top-8 border border-[var(--border)] rounded-lg p-4 space-y-3">
                  <h2
                    className="text-lg tracking-[0.15em] uppercase"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    Order Summary
                  </h2>

                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={`${item.productId}-${item.size}`} className="flex gap-3">
                        <div className="shrink-0 w-12 h-12 bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
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
                          <p className="text-xs text-[var(--text-secondary)]">
                            {item.size} &times; {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm text-[var(--text-primary)] shrink-0">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Total</span>
                      <span
                        className="text-xl text-[var(--accent)]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        ৳{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    {paymentMethod === 'cod'
                      ? 'Pay when your order arrives. No advance payment required.'
                      : `Pay instantly via ${paymentLabel(paymentMethod)} for faster delivery. You will be contacted after placing your order.`}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}