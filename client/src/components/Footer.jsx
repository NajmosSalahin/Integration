import { Link } from 'react-router-dom';

export default function Footer() {
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

        <div className="pt-6 border-t border-gray-800/50 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Integration. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
