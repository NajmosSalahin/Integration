import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import useCart from '../stores/cartStore';
import { useAuth } from '../context/AuthContext';
import SearchResults from './SearchResults';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const itemCount = useCart((s) => s.getItemCount());
  const { user } = useAuth();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedResults = searchQuery
    ? products?.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowResults(false);
      handleSearch(e);
    }
  };

  return (
    <header className="bg-[var(--bg-card)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo-icon.png" alt="Integration" className="h-8 w-8" />
              <span
                className="text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Integration
              </span>
            </Link>

            <div className="flex-1 max-w-xl hidden md:block">
              <form onSubmit={handleSearch} ref={searchRef} className="relative">
                <input
                  type="search"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setShowResults(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[#111] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]"
                />
                <Search size={18} className="absolute left-3 top-3 text-[var(--text-secondary)]" />

                <AnimatePresence>
                  {showResults && debouncedResults.length > 0 && (
                    <SearchResults
                      results={debouncedResults}
                      onSelect={() => setShowResults(false)}
                    />
                  )}
                </AnimatePresence>
              </form>
            </div>

            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <Link
                    to="/admin/orders"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/admin/products"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Products
                  </Link>
                </div>
              )}

              <Link to="/cart" className="relative">
                <ShoppingCart size={20} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--accent)] text-white text-[10px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <button
                  onClick={() => {}}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <User size={20} />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <User size={20} />
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[var(--border)]"
            >
              <nav className="py-3 space-y-2">
                <Link to="/" className="block py-2 text-sm text-[var(--text-primary)]">Home</Link>
                <Link to="/about" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</Link>
                <Link to="/contact" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</Link>
                <Link to="/faq" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">FAQ</Link>
                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin/orders" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Orders</Link>
                    <Link to="/admin/products" className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Products</Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
