import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            INVALID LINK
          </h1>
          <p className="text-gray-400 text-sm">This password reset link is invalid or missing a token.</p>
          <Link to="/forgot-password" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ token, password: form.password, confirmPassword: form.confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            PASSWORD RESET
          </h1>
          <p className="text-gray-400 text-sm">Your password has been reset. Redirecting to login...</p>
          <Link to="/login" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password — Integration</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1 className="mt-4 text-xl tracking-[0.15em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              RESET PASSWORD
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-sm text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="mt-1 text-[11px] text-gray-500">Min 8 chars, uppercase, lowercase, number</p>
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-sm text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm tracking-[0.2em] uppercase rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
