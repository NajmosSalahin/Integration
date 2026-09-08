import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminOrders from './pages/admin/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center">
              <p className="text-gray-400">Orders page — coming soon</p>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
