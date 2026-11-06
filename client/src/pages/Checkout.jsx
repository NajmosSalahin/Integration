import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, RefreshCw, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../api/auth';
import { createOrder } from '../api/orders';
import { validateCoupon } from '../api/coupons';
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
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const total = getTotal();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ phone: null, address: null });
  const [promoCode, setPromoCode] = useState('');
  const [verificationAction, setVerificationAction] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [promo, setPromo] = useState({
    status: 'idle',
    appliedCode: '',
    discount: 0,
    subtotal: 0,
    totalAmount: 0,
    message: '',
  });
  const touched = useRef(false);

  const cartItems = items.map((item) => ({
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
  }));

  useEffect(() => {
    setPromo((p) => {
      if (p.status !== 'applied' || total === p.subtotal) return p;
      return { status: 'idle', appliedCode: '', discount: 0, subtotal: 0, totalAmount: 0, message: '' };
    });
  }, [total]);

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromo((p) => ({ ...p, status: 'checking', message: '' }));
    try {
      const result = await validateCoupon({ code, items: cartItems });
      if (result.valid) {
        setPromo({
          status: 'applied',
          appliedCode: result.code,
          discount: result.discount,
          subtotal: result.subtotal,
          totalAmount: result.totalAmount,
          message: '',
        });
      } else {
        setPromo((p) => ({
          ...p,
          status: 'error',
          appliedCode: '',
          discount: 0,
          message: result.message || 'Invalid coupon code.',
        }));
      }
    } catch (err) {
      setPromo((p) => ({
        ...p,
        status: 'error',
        appliedCode: '',
        discount: 0,
        message: err.message || 'Could not validate coupon.',
      }));
    }
  };

  const clearPromo = () => {
    setPromoCode('');
    setPromo({ status: 'idle', appliedCode: '', discount: 0, subtotal: 0, totalAmount: 0, message: '' });
  };

  useEffect(() => {
    if (!user || touched.current) return;
    const saved = defaultAddress(user);
    if (!phone && (user.phone || saved?.phone)) setPhone(user.phone || saved.phone);
    if (!address && saved) setAddress(composeAddress(saved));
  }, [user]);

  const handleResendVerification = async () => {
    setVerificationAction('sending');
    setVerificationMessage('');
    setVerificationError('');
    try {
      const result = await resendVerification();
      setVerificationMessage(result.message || 'Verification email sent.');
    } catch (err) {
      setVerificationError(err.message || 'Could not send verification email.');
    } finally {
      setVerificationAction(null);
    }
  };

  const handleRefreshVerification = async () => {
    setVerificationAction('refreshing');
    setVerificationMessage('');
    setVerificationError('');
    try {
      await refreshUser();
    } catch {
      setVerificationError('Could not refresh your account status.');
    } finally {
      setVerificationAction(null);
    }
  };

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

  if (user && !user.emailVerified) {
    return (
      <>
        <MetaTags title="Verify Email to Checkout" description="Verify your email before placing an order." path="/checkout" noindex />
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <Navbar />
          <main className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-xl mx-auto border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)] p-6 sm:p-8 text-center space-y-4">
              <Mail size={40} className="mx-auto text-[var(--accent)]" aria-hidden="true" />
              <h1
                className="text-3xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Verify your email
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                We need to verify <span className="text-[var(--text-primary)]">{user.email}</span> before we can
                accept your order.
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Check your inbox for the verification link, then come back and refresh your status.
              </p>

              {verificationMessage && (
                <p className="text-sm text-emerald-400" role="status">{verificationMessage}</p>
              )}
              {verificationError && (
                <p className="text-sm text-red-400" role="alert">{verificationError}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={Boolean(verificationAction)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] text-sm tracking-wider uppercase transition-colors disabled:cursor-not-allowed"
                >
                  {verificationAction === 'sending' ? 'Sending...' : 'Resend verification email'}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshVerification}
                  disabled={Boolean(verificationAction)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-sm tracking-wider uppercase transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={verificationAction === 'refreshing' ? 'animate-spin' : ''} aria-hidden="true" />
                  {verificationAction === 'refreshing' ? 'Checking...' : 'Refresh status'}
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] pt-2">
                You can also manage this from your{' '}
                <Link to="/account" className="text-[var(--accent)] hover:text-blue-400 transition-colors">
                  account profile
                </Link>
                .
              </p>
            </div>
          </main>
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
    if (!user?.emailVerified) {
      setError('Please verify your email before placing an order.');
      return;
    }
    if (!validate()) return;

    const trimmedPromo = promoCode.trim().toUpperCase();
    if (trimmedPromo) {
      if (promo.status !== 'applied' || promo.appliedCode !== trimmedPromo) {
        setError('Apply your coupon code before placing the order.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: cartItems,
        deliveryAddress: address,
        contactPhone: phone,
        paymentMethod,
      };
      if (trimmedPromo) orderData.promoCode = trimmedPromo;

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

                  <div className="border-t border-[var(--border)] pt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromo((p) =>
                            p.status === 'applied' || p.status === 'error'
                              ? { status: 'idle', appliedCode: '', discount: 0, subtotal: 0, totalAmount: 0, message: '' }
                              : p
                          );
                        }}
                        disabled={promo.status === 'checking' || submitting}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        className={inputClass(false)}
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promo.status === 'checking' || submitting || !promoCode.trim()}
                        className="shrink-0 px-4 rounded-lg text-xs tracking-[0.15em] uppercase transition-colors bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promo.status === 'checking' ? '...' : 'Apply'}
                      </button>
                    </div>

                    {promo.status === 'error' && (
                      <p className="text-xs text-red-400" role="alert">
                        {promo.message}
                      </p>
                    )}

                    {promo.status === 'applied' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)] inline-flex items-center gap-1.5">
                          <Tag size={13} aria-hidden="true" /> {promo.appliedCode}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-emerald-500">-৳{promo.discount.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={clearPromo}
                            disabled={submitting}
                            className="text-xs text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                            aria-label="Remove coupon"
                          >
                            Remove
                          </button>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Total</span>
                      <span
                        className="text-xl text-[var(--accent)]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        ৳{(promo.status === 'applied' ? promo.totalAmount : total).toLocaleString()}
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