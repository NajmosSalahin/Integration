import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, X, LogOut, Package, LogIn, User, Loader2, BadgePercent, LayoutGrid, Tags } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import useCart from '../stores/cartStore';
import { useAuth } from '../context/AuthContext';
import { searchProducts } from '../lib/smartSearch';
import { getAdminSections } from '../lib/permissions';
import useDebouncedValue from '../hooks/useDebouncedValue';
import SearchResults from './SearchResults';
import Spinner from './ui/Spinner';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const itemCount = useCart((s) => s.getItemCount());
  const { user, logout } = useAuth();
  const adminSections = getAdminSections(user);
  const [cartFlash, setCartFlash] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery({
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

  const prevCount = useRef(itemCount);
  useEffect(() => {
    if (itemCount > prevCount.current) {
      setCartFlash(true);
      const t = setTimeout(() => setCartFlash(false), 600);
      prevCount.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    if (location.pathname === '/') {
      setShowResults(false);
    }
  }, [location]);

  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const debouncedResults = useMemo(
    () => searchProducts(products, debouncedQuery, 6),
    [products, debouncedQuery]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setMobileSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const navLinkClass = (active) =>
    `transition-colors text-sm ${
      active
        ? 'text-[var(--accent)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  const showResultsDropdown =
    showResults && debouncedQuery.trim() && !productsLoading;

  return (
    <header className="bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center space-x-3 shrink-0">
              <img src="/logo-icon.png" alt="Integration" width={32} height={32} className="h-8 w-8" />
              <span
                className="text-xl hidden sm:block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Integration
              </span>
            </Link>

            <div className="flex-1 max-w-2xl min-w-0 hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative" role="search">
                <input
                  type="search"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  aria-label="Search designs"
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]"
                />
                <Search size={18} className="absolute left-3 top-3 text-[var(--text-secondary)]" aria-hidden="true" />

                <AnimatePresence>
                  {showResultsDropdown && (
                    <SearchResults
                      results={debouncedResults}
                      query={debouncedQuery}
                      onSelect={() => setShowResults(false)}
                    />
                  )}
                </AnimatePresence>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Search"
                aria-expanded={mobileSearchOpen}
                aria-controls="mobile-search-panel"
              >
                <Search size={20} aria-hidden="true" />
              </button>

              <nav
                aria-label="Main navigation"
                className="hidden md:flex items-center gap-6"
              >
                <Link
                  to="/"
                  className={navLinkClass(isActive('/', true))}
                  aria-current={isActive('/', true) ? 'page' : undefined}
                >
                  Home
                </Link>

                <Link
                  to="/shop"
                  className={navLinkClass(isActive('/shop'))}
                  aria-current={isActive('/shop') ? 'page' : undefined}
                >
                  Shop
                </Link>

                {adminSections.length > 0 && (
                  <>
                    {adminSections.includes('orders') && (
                      <Link
                        to="/admin/orders"
                        className={navLinkClass(isActive('/admin/orders'))}
                        aria-current={isActive('/admin/orders') ? 'page' : undefined}
                      >
                        Orders
                      </Link>
                    )}
                    {adminSections.includes('products') && (
                      <Link
                        to="/admin/products"
                        className={navLinkClass(isActive('/admin/products'))}
                        aria-current={isActive('/admin/products') ? 'page' : undefined}
                      >
                        Products
                      </Link>
                    )}
                    {adminSections.includes('coupons') && (
                      <Link
                        to="/admin/coupons"
                        className={navLinkClass(isActive('/admin/coupons'))}
                        aria-current={isActive('/admin/coupons') ? 'page' : undefined}
                      >
                        Coupons
                      </Link>
                    )}
                    {adminSections.includes('banners') && (
                      <Link
                        to="/admin/banners"
                        className={navLinkClass(isActive('/admin/banners'))}
                        aria-current={isActive('/admin/banners') ? 'page' : undefined}
                      >
                        Banners
                      </Link>
                    )}
                    {adminSections.includes('categories') && (
                      <Link
                        to="/admin/categories"
                        className={navLinkClass(isActive('/admin/categories'))}
                        aria-current={isActive('/admin/categories') ? 'page' : undefined}
                      >
                        Categories
                      </Link>
                    )}
                  </>
                )}
              </nav>

              <Link
                to="/cart"
                className="relative p-2.5 group"
                aria-label={`Cart, ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              >
                <ShoppingCart
                  size={20}
                  className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors"
                  aria-hidden="true"
                />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={cartFlash ? { scale: 0 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-[var(--accent)] text-white text-[10px] rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-controls="user-menu"
                >
                  <User size={18} aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
                      role="menu"
                      id="user-menu"
                    >
                      {user && (
                        <div className="px-4 py-3 border-b border-[var(--border)]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                              <User size={18} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                              <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div role="none">
                        <div className="py-0.5" role="none">
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                          role="menuitem"
                        >
                          <User size={16} aria-hidden="true" />
                          My Account
                        </Link>
                        {user ? (
                          <Link
                            to="/account?tab=orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            role="menuitem"
                          >
                            <Package size={16} aria-hidden="true" />
                            My Orders
                          </Link>
                        ) : (
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            role="menuitem"
                          >
                            <Package size={16} aria-hidden="true" />
                            My Orders
                          </Link>
                        )}
                        {adminSections.length > 0 && (
                          <>
                            {adminSections.includes('orders') && (
                              <Link
                                to="/admin/orders"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                                role="menuitem"
                              >
                                <Package size={16} aria-hidden="true" />
                                Admin Orders
                              </Link>
                            )}
                            {adminSections.includes('products') && (
                              <Link
                                to="/admin/products"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                                role="menuitem"
                              >
                                <Package size={16} aria-hidden="true" />
                                Admin Products
                              </Link>
                            )}
                            {adminSections.includes('coupons') && (
                              <Link
                                to="/admin/coupons"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                                role="menuitem"
                              >
                                <BadgePercent size={16} aria-hidden="true" />
                                Admin Coupons
                              </Link>
                            )}
                            {adminSections.includes('banners') && (
                              <Link
                                to="/admin/banners"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                                role="menuitem"
                              >
                                <LayoutGrid size={16} aria-hidden="true" />
                                Admin Banners
                              </Link>
                            )}
                            {adminSections.includes('categories') && (
                              <Link
                                to="/admin/categories"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors sm:hidden"
                                role="menuitem"
                              >
                                <Tags size={16} aria-hidden="true" />
                                Admin Categories
                              </Link>
                            )}
                          </>
                        )}
                        <div className="border-t border-[var(--border)] my-0.5" role="none" />
                        {user ? (
                          <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full disabled:opacity-50"
                            role="menuitem"
                          >
                            {loggingOut ? <Spinner size={16} /> : <LogOut size={16} aria-hidden="true" />}
                            Log Out
                          </button>
                        ) : (
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--accent)] hover:text-blue-400 hover:bg-[var(--bg-primary)] transition-colors"
                            role="menuitem"
                          >
                            <LogIn size={16} aria-hidden="true" />
                            Log In
                          </Link>
                        )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu-panel"
              >
                {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              id="mobile-search-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[var(--border)] overflow-hidden"
            >
              <form onSubmit={handleSearch} className="py-3 relative" role="search">
                <input
                  type="search"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  autoFocus
                  aria-label="Search designs"
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)] appearance-none"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" aria-hidden="true" />

                <div ref={searchRef}>
                  <AnimatePresence>
                    {showResultsDropdown && (
                      <SearchResults
                        results={debouncedResults}
                        query={debouncedQuery}
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
              id="mobile-menu-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[var(--border)] overflow-hidden"
            >
              <nav aria-label="Mobile navigation" className="py-2 space-y-0.5">
                <Link to="/" className={`block py-2 px-1 text-sm transition-colors ${isActive('/', true) ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`} aria-current={isActive('/', true) ? 'page' : undefined}>Home</Link>
                <Link to="/shop" className={`block py-2 px-1 text-sm transition-colors ${isActive('/shop') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} aria-current={isActive('/shop') ? 'page' : undefined}>Shop</Link>
                <Link to="/cart" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Cart {itemCount > 0 && <span className="text-[var(--accent)]">({itemCount})</span>}
                </Link>
                <Link to={user ? "/account?tab=orders" : "/login"} className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">My Orders</Link>
                <Link to="/about" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</Link>
                <Link to="/contact" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Contact</Link>
                <Link to="/faq" className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">FAQ</Link>
                {adminSections.length > 0 && (
                  <>
                    <div className="border-t border-[var(--border)] my-2" />
                    {adminSections.includes('orders') && (
                      <Link to="/admin/orders" className={`block py-2 px-1 text-sm transition-colors ${isActive('/admin/orders') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} aria-current={isActive('/admin/orders') ? 'page' : undefined}>Admin Orders</Link>
                    )}
                    {adminSections.includes('products') && (
                      <Link to="/admin/products" className={`block py-2 px-1 text-sm transition-colors ${isActive('/admin/products') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} aria-current={isActive('/admin/products') ? 'page' : undefined}>Admin Products</Link>
                    )}
                    {adminSections.includes('coupons') && (
                      <Link to="/admin/coupons" className={`block py-2 px-1 text-sm transition-colors ${isActive('/admin/coupons') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} aria-current={isActive('/admin/coupons') ? 'page' : undefined}>Admin Coupons</Link>
                    )}
                    {adminSections.includes('banners') && (
                      <Link to="/admin/banners" className={`block py-2 px-1 text-sm transition-colors ${isActive('/admin/banners') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} aria-current={isActive('/admin/banners') ? 'page' : undefined}>Admin Banners</Link>
                    )}
                    {adminSections.includes('categories') && (
                      <Link to="/admin/categories" className={`block py-2 px-1 text-sm transition-colors ${isActive('/admin/categories') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} aria-current={isActive('/admin/categories') ? 'page' : undefined}>Admin Categories</Link>
                    )}
                  </>
                )}
                <div className="border-t border-[var(--border)] my-2" />
                {user ? (
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block py-2 px-1 text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors w-full text-left disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {loggingOut && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
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