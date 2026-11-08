import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BadgePercent,
  ClipboardList,
  Image as ImageIcon,
  Package,
  Plus,
  ShieldAlert,
  Tags,
} from 'lucide-react';
import MetaTags from '../../components/MetaTags';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { hasAdminSection } from '../../lib/permissions';
import { getAllOrders } from '../../api/orders';
import { getAllProductsAdmin } from '../../api/products';
import { getCoupons } from '../../api/coupons';
import { getAdminBanners } from '../../api/banners';
import { getAdminCategories } from '../../api/categories';
import { formatCurrency, formatDate, shortId } from '../../lib/format';
import { orderStatusLabel, orderStatusTone } from '../../lib/orderStatus';
import { paymentLabel } from '../../lib/paymentMethods';

function StatCard({ to, icon: Icon, label, value, hint, loading }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition-colors hover:border-[var(--accent)]/50"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
          <Icon size={19} aria-hidden="true" />
        </span>
        <ArrowRight
          size={16}
          className="text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
          aria-hidden="true"
        />
      </div>
      <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
      )}
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{hint}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const canOrders = hasAdminSection(user, 'orders');
  const canProducts = hasAdminSection(user, 'products');
  const canCoupons = hasAdminSection(user, 'coupons');
  const canBanners = hasAdminSection(user, 'banners');
  const canCategories = hasAdminSection(user, 'categories');

  const ordersQuery = useQuery({
    queryKey: ['adminOrders', 'dashboard'],
    queryFn: () => getAllOrders({ page: 1, limit: 5 }),
    enabled: canOrders,
  });

  const productsQuery = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAllProductsAdmin,
    enabled: canProducts,
  });

  const couponsQuery = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: getCoupons,
    enabled: canCoupons,
  });

  const bannersQuery = useQuery({
    queryKey: ['adminBanners'],
    queryFn: getAdminBanners,
    enabled: canBanners,
  });

  const categoriesQuery = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
    enabled: canCategories,
  });

  const products = productsQuery.data || [];
  const coupons = couponsQuery.data || [];
  const banners = bannersQuery.data || [];
  const categories = categoriesQuery.data || [];
  const recentOrders = ordersQuery.data?.orders || [];
  const statusCounts = ordersQuery.data?.statusCounts || {};

  const hasAnySection = [canOrders, canProducts, canCoupons, canBanners, canCategories].some(Boolean);

  return (
    <>
      <MetaTags
        title="Admin Overview"
        description="Admin dashboard — store overview."
        path="/admin"
        noindex
      />

      <AdminPageHeader
        title="Overview"
        description="Manage orders, catalog, and storefront content from one place."
      >
        {canProducts && (
          <Link
            to="/admin/products?new=1"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={16} aria-hidden="true" />
            Add product
          </Link>
        )}
        {canCoupons && (
          <Link
            to="/admin/coupons?new=1"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            <Plus size={16} aria-hidden="true" />
            New coupon
          </Link>
        )}
      </AdminPageHeader>

      {!hasAnySection ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-10 text-center">
          <ShieldAlert size={32} className="mx-auto mb-3 text-amber-400" aria-hidden="true" />
          <p className="text-[var(--text-primary)]">No admin sections assigned</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Ask a full admin to grant access to at least one section.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {canOrders && (
              <StatCard
                to="/admin/orders"
                icon={ClipboardList}
                label="Orders"
                value={ordersQuery.data?.totalOrders ?? 0}
                hint={`${statusCounts.pending_payment || 0} pending payment`}
                loading={ordersQuery.isLoading}
              />
            )}
            {canProducts && (
              <StatCard
                to="/admin/products"
                icon={Package}
                label="Products"
                value={products.length}
                hint={`${products.filter((p) => p.active).length} active`}
                loading={productsQuery.isLoading}
              />
            )}
            {canCoupons && (
              <StatCard
                to="/admin/coupons"
                icon={BadgePercent}
                label="Coupons"
                value={coupons.filter((c) => c.active).length}
                hint={`${coupons.length} total`}
                loading={couponsQuery.isLoading}
              />
            )}
            {canBanners && (
              <StatCard
                to="/admin/banners"
                icon={ImageIcon}
                label="Banners"
                value={banners.filter((b) => b.active).length}
                hint={`${banners.length} total`}
                loading={bannersQuery.isLoading}
              />
            )}
            {canCategories && (
              <StatCard
                to="/admin/categories"
                icon={Tags}
                label="Categories"
                value={categories.filter((c) => c.active).length}
                hint={`${categories.length} total`}
                loading={categoriesQuery.isLoading}
              />
            )}
          </div>

          {canOrders && (
            <section className="mt-8" aria-labelledby="recent-orders-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 id="recent-orders-heading" className="text-lg font-medium">
                    Recent orders
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">Latest five orders across the store.</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-1 text-sm text-[var(--accent)] transition-colors hover:text-blue-400"
                >
                  View all
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {ordersQuery.isLoading ? (
                <div className="space-y-2 rounded-xl border border-[var(--border)] p-4" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center text-sm text-[var(--text-secondary)]">
                  No orders yet.
                </div>
              ) : (
                <>
                  <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
                    <table className="w-full text-sm" aria-label="Recent orders">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Order</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Customer</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)]">Total</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Payment</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id} className="border-b border-[var(--border)]/50 last:border-0">
                            <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)]">#{shortId(order._id)}</td>
                            <td className="px-4 py-3">
                              <p className="text-[var(--text-primary)]">{order.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{order.userId?.email || ''}</p>
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--text-primary)]">{formatCurrency(order.totalAmount)}</td>
                            <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{paymentLabel(order.paymentMethod)}</td>
                            <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-3">
                              <StatusBadge tone={orderStatusTone(order.status)}>
                                {orderStatusLabel(order.status)}
                              </StatusBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2 md:hidden">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs text-[var(--text-primary)]">#{shortId(order._id)}</span>
                          <StatusBadge tone={orderStatusTone(order.status)}>
                            {orderStatusLabel(order.status)}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-primary)]">{order.userId?.name || 'Unknown'}</p>
                        <div className="mt-1 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                          <span>{formatDate(order.createdAt)}</span>
                          <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}
