import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div className="col-span-2 sm:col-span-1">
            <Link
              to="/"
              className="text-lg tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-utility)" }}
            >
              INTEGRATION
            </Link>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Different Styles, One Identity.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
              Shop
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
              Support
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/payments" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Payments
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
              About
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/about" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] mb-6">
          <div className="max-w-md">
            <NewsletterForm />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} Integration. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
