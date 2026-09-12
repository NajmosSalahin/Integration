import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, LogOut, Package, LogIn, User } from 'lucide-react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const itemCount = useCart((s) => s.getItemCount());
  const { user, logout } = useAuth();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setShowResults(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [searchParams]);

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
      setShowResults(false);
      setMobileSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowResults(false);
      handleSearch(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center space-x-3 shrink-0">
              <img src="/logo-icon.png" alt="Integration" className="h-8 w-8" />
              <span
                className="text-xl hidden sm:block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Integration
              </span>
            </Link>

            <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
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

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                to="/"
                className="hidden sm:block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm mr-2"
              >
                Home
              </Link>

              <Link
                to="/shop"
                className="hidden sm:block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm mr-2"
              >
                Shop
              </Link>

              {user?.role === 'admin' && (
                <div className="hidden sm:flex items-center gap-3 text-sm mr-2">
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

              <Link to="/cart" className="relative p-2.5" aria-label="Cart">
                <ShoppingCart size={20} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--accent)] text-white text-[10px] rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <User size={18} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[#111] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
                      role="menu"
                    >
                      {user && (
                        <div className="px-4 py-3 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                              <User size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                              <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      )}
                        <div className="py-0.5">
                        {user ? (
                          <Link
                            to="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            role="menuitem"
                          >
                            <Package size={16} />
                            My Orders
                          </Link>
                        ) : (
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            role="menuitem"
                          >
                            <Package size={16} />
                            My Orders
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <>
                            <Link
                              to="/admin/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                              role="menuitem"
                            >
                              <Package size={16} />
                              Admin Orders
                            </Link>
                            <Link
                              to="/admin/products"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                              role="menuitem"
                            >
                              <Package size={16} />
                              Admin Products
                            </Link>
                          </>
                        )}
                        <div className="border-t border-[var(--border)] my-0.5" />
                        {user ? (
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
                            role="menuitem"
                          >
                            <LogOut size={16} />
                            Log Out
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--accent)] hover:text-blue-400 hover:bg-[var(--bg-primary)] transition-colors"
                            role="menuitem"
                          >
                            <LogIn size={16} />
                            Log In
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[var(--border)] overflow-hidden"
            >
              <form onSubmit={handleSearch} className="py-3 relative">
                <input
                  type="search"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setShowResults(true)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[#111] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]"
                />
                <Search size={18} className="absolute left-3 top-3.5 text-[var(--text-secondary)]" />

                <div ref={searchRef}>
                  <AnimatePresence>
                    {showResults && debouncedResults.length > 0 && (
                      <SearchResults
                        results={debouncedResults}
                        onSelect={() => { setShowResults(false); setMobileSearchOpen(false); }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[var(--border)] overflow-hidden"
            >
              <nav className="py-2 space-y-0.5">
                <Link to="/" className="block py-2 px-1 text-sm text-[var(--text-primary)]">Home</Link>
                <Link to="/shop" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Shop</Link>
                <Link to="/cart" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Cart {itemCount > 0 && <span className="text-[var(--accent)]">({itemCount})</span>}
                </Link>
                <Link to={user ? "/orders" : "/login"} className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">My Orders</Link>
                <Link to="/about" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</Link>
                <Link to="/contact" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</Link>
                <Link to="/faq" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">FAQ</Link>
                {user?.role === 'admin' && (
                  <>
                    <div className="border-t border-[var(--border)] my-2" />
                    <Link to="/admin/orders" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Admin Orders</Link>
                    <Link to="/admin/products" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Admin Products</Link>
                  </>
                )}
                <div className="border-t border-[var(--border)] my-2" />
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors w-full text-left"
                  >
                    Log Out
                  </button>
                ) : (
                  <Link to="/login" className="block py-2 px-1 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">Log In</Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
