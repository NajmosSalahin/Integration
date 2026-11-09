import { Link } from 'react-router-dom';
import { ChevronUp, Facebook, X } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import { siteConfig } from '../lib/site';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: siteConfig.social.facebook, Icon: Facebook },
  { label: 'X', href: siteConfig.social.x, Icon: X },
].filter(({ href }) => Boolean(href));

export default function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 mb-6">
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

          <nav aria-labelledby="footer-shop-heading">
            <h3 id="footer-shop-heading" className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
              Shop
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/shop" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-support-heading">
            <h3 id="footer-support-heading" className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
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
          </nav>

          <nav aria-labelledby="footer-about-heading" className="col-span-2 sm:col-span-1">
            <h3 id="footer-about-heading" className="text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)] mb-2">
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
          </nav>
        </div>

        <div className="pt-4 border-t border-[var(--border)] mb-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-md w-full">
              <NewsletterForm />
            </div>
            <div className="shrink-0 md:-translate-y-1">
              <span className="hand-drawn-underline text-xs tracking-[0.15em] uppercase text-[var(--text-secondary)]">
                Follow us on
              </span>
              <div className="flex items-center gap-3 mt-4">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border)] text-center flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} Integration. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            aria-label="Back to top"
          >
            Back to top
            <ChevronUp size={12} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}