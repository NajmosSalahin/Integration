import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgePercent,
  ClipboardList,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Store,
  Tags,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminSections } from '../../lib/permissions';
import Spinner from '../ui/Spinner';

const SECTION_NAV = {
  orders: { label: 'Orders', icon: ClipboardList },
  products: { label: 'Products', icon: Package },
  coupons: { label: 'Coupons', icon: BadgePercent },
  banners: { label: 'Banners', icon: ImageIcon },
  categories: { label: 'Categories', icon: Tags },
};

function NavItems({ sections, onNavigate }) {
  const itemClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <NavLink to="/admin" end className={itemClass} onClick={onNavigate}>
        <LayoutDashboard size={18} aria-hidden="true" />
        Overview
      </NavLink>

      {sections.length > 0 && (
        <p className="px-3 pb-1 pt-4 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Manage
        </p>
      )}

      {sections.map((section) => {
        const item = SECTION_NAV[section];
        if (!item) return null;
        const Icon = item.icon;
        return (
          <NavLink
            key={section}
            to={`/admin/${section}`}
            className={itemClass}
            onClick={onNavigate}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarContent({ sections, user, loggingOut, onLogout, onNavigate }) {
  return (
    <>
      <Link
        to="/admin"
        onClick={onNavigate}
        className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-5 py-5"
      >
        <img src="/logo-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
        <span>
          <span
            className="block text-lg leading-none tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Integration
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Admin workspace
          </span>
        </span>
      </Link>

      <NavItems sections={sections} onNavigate={onNavigate} />

      <div className="shrink-0 space-y-1 border-t border-[var(--border)] p-3">
        {user && (
          <div className="mb-2 rounded-lg bg-[var(--bg-secondary)] px-3 py-2.5">
            <p className="truncate text-sm text-[var(--text-primary)]">{user.name}</p>
            <p className="truncate text-xs text-[var(--text-secondary)]">{user.email}</p>
          </div>
        )}
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <Store size={17} aria-hidden="true" />
          View store
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          {loggingOut ? <Spinner size={17} /> : <LogOut size={17} aria-hidden="true" />}
          Log out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const drawerRef = useRef(null);
  const sections = getAdminSections(user);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const getFocusable = () =>
      drawerRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    getFocusable()?.[0]?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const currentLabel =
    location.pathname === '/admin'
      ? 'Overview'
      : SECTION_NAV[location.pathname.split('/')[2]]?.label || 'Admin';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--bg-primary)] lg:flex">
        <SidebarContent
          sections={sections}
          user={user}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Open admin menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span
          className="text-lg tracking-[0.12em] uppercase"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {currentLabel}
        </span>
        <Link
          to="/"
          className="ml-auto text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          View store
        </Link>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--bg-primary)] shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Admin menu"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Close admin menu"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <SidebarContent
                sections={sections}
                user={user}
                loggingOut={loggingOut}
                onLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
