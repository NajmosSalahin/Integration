import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, Heart, CreditCard, SlidersHorizontal, LogOut, Loader2 } from 'lucide-react';
import MetaTags from '../components/MetaTags';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import ProfileSection from '../components/account/ProfileSection';
import AddressesSection from '../components/account/AddressesSection';
import WishlistSection from '../components/account/WishlistSection';
import PaymentsSection from '../components/account/PaymentsSection';
import SettingsSection from '../components/account/SettingsSection';

const TABS = [
  { value: 'profile', label: 'My Profile', icon: User },
  { value: 'orders', label: 'My Orders', icon: Package },
  { value: 'addresses', label: 'Addresses', icon: MapPin },
  { value: 'wishlist', label: 'Wishlist', icon: Heart },
  { value: 'payments', label: 'Payment Methods', icon: CreditCard },
  { value: 'settings', label: 'Account Settings', icon: SlidersHorizontal },
];

export default function Account() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const tabParam = searchParams.get('tab') || '';
  const activeTab = TABS.some((t) => t.value === tabParam) ? tabParam : 'profile';

  const handleTab = (value) => {
    if (value === 'orders') {
      navigate('/orders');
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (value === 'profile') {
      next.delete('tab');
    } else {
      next.set('tab', value);
    }
    setSearchParams(next);
  };

  if (tabParam === 'orders') {
    return <Navigate to="/orders" replace />;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const sidebarClass = (active) =>
    `flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-[8px] text-sm border transition-colors ${
      active
        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
        : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:text-[var(--text-primary)]'
    }`;

  const pillClass = (active) =>
    `px-4 py-2 text-sm rounded-full border transition-colors whitespace-nowrap ${
      active
        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
    }`;

  return (
    <>
      <MetaTags
        title="My Account"
        description="Manage your profile, orders, addresses, saved designs, and settings."
        path="/account"
        noindex
      />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              My Account
            </h1>

            <div className="lg:hidden mb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1" role="group" aria-label="Account sections">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => handleTab(tab.value)}
                    aria-pressed={activeTab === tab.value}
                    className={pillClass(activeTab === tab.value)}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:flex lg:gap-8">
              <aside className="hidden lg:block w-60 shrink-0">
                <div className="sticky top-20 max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-thin pr-1">
                  <nav aria-label="Account sections">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => handleTab(tab.value)}
                          aria-current={activeTab === tab.value ? 'page' : undefined}
                          className={sidebarClass(activeTab === tab.value)}
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          <Icon size={16} aria-hidden="true" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>

                  <div className="my-2 border-t border-[var(--border)]" />

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-[8px] text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {loggingOut ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <LogOut size={16} aria-hidden="true" />
                    )}
                    Log Out
                  </button>
                </div>
              </aside>

              <div className="flex-1 min-w-0">
                {activeTab === 'profile' && <ProfileSection />}
                {activeTab === 'addresses' && <AddressesSection />}
                {activeTab === 'wishlist' && <WishlistSection />}
                {activeTab === 'payments' && <PaymentsSection />}
                {activeTab === 'settings' && <SettingsSection />}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}