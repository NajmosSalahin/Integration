import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSuccess(true);
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
            CHECK YOUR EMAIL
          </h1>
          <p className="text-gray-400 text-sm">
            If an account exists with <span className="text-white">{email}</span>, we sent a password reset link.
          </p>
          <Link to="/login" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password — Integration</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1 className="mt-4 text-xl tracking-[0.15em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              FORGOT PASSWORD
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--accent)] hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
