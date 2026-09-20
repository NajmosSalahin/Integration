import { Suspense } from 'react';
import lazyWithRetry from './lib/lazyWithRetry';
import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Spinner from './components/ui/Spinner';
import Home from './pages/Home';

const Shop = lazyWithRetry(() => import('./pages/Shop'));
const ProductDetail = lazyWithRetry(() => import('./pages/ProductDetail'));
const Cart = lazyWithRetry(() => import('./pages/Cart'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const OrderConfirmation = lazyWithRetry(() => import('./pages/OrderConfirmation'));
const Signup = lazyWithRetry(() => import('./pages/Signup'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));
const VerifyEmail = lazyWithRetry(() => import('./pages/VerifyEmail'));
const AdminOrders = lazyWithRetry(() => import('./pages/admin/Orders'));
const AdminProducts = lazyWithRetry(() => import('./pages/admin/Products'));
const AdminCoupons = lazyWithRetry(() => import('./pages/admin/Coupons'));
const AdminBanners = lazyWithRetry(() => import('./pages/admin/Banners'));
const AdminCategories = lazyWithRetry(() => import('./pages/admin/Categories'));
const Account = lazyWithRetry(() => import('./pages/Account'));
const About = lazyWithRetry(() => import('./pages/About'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const FAQ = lazyWithRetry(() => import('./pages/legal/FAQ'));
const Shipping = lazyWithRetry(() => import('./pages/legal/Shipping'));
const Returns = lazyWithRetry(() => import('./pages/legal/Returns'));
const Payments = lazyWithRetry(() => import('./pages/legal/Payments'));
const Privacy = lazyWithRetry(() => import('./pages/legal/Privacy'));
const Cookies = lazyWithRetry(() => import('./pages/legal/Cookies'));
const Terms = lazyWithRetry(() => import('./pages/legal/Terms'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

function App() {
  return (
    <>
      <ScrollToTop />
      <div className="noise-overlay" aria-hidden="true" />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
            <Spinner />
          </div>
        }
      >
        <main>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/admin"
            element={<Navigate to="/admin/orders" replace />}
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute section="orders">
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute section="products">
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute section="coupons">
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/banners"
            element={
              <AdminRoute section="banners">
                <AdminBanners />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute section="categories">
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="/orders" element={<Navigate to="/account?tab=orders" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </>
  );
}

export default App;