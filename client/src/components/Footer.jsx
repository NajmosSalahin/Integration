import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { subscribeNewsletter } from '../api/newsletter';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => {
      setSuccess(true);
      setEmail('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);
    mutation.mutate(email);
  };

  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <Link
              to="/"
              className="text-lg tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              INTEGRATION
            </Link>
            <p className="mt-2 text-xs text-gray-500">
              Different Styles, One Identity.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">
              Shop
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-500 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/payments" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Payments
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800/50 mb-8">
          <div className="max-w-md">
            <h3
              className="text-sm tracking-[0.15em] uppercase mb-1"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Stay in the loop
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              New drops, no spam.
            </p>

            {success ? (
              <p className="text-sm text-green-400">Subscribed successfully.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs tracking-[0.15em] uppercase rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? '...' : 'Subscribe'}
                </button>
              </form>
            )}

            {mutation.isError && (
              <p className="mt-2 text-xs text-red-400">{mutation.error.message}</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800/50 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Integration. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
