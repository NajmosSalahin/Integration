import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, signupError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      setSuccess(true);
    } catch (err) {
      // error handled by signupError
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CHECK YOUR EMAIL
          </h1>
          <p className="text-gray-400 text-sm">
            We sent a verification link to <span className="text-white">{form.email}</span>.
            Click the link to verify your account.
          </p>
          <Link to="/login" className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign Up — Integration</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1 className="mt-2 text-xl tracking-[0.15em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CREATE ACCOUNT
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {signupError && (
              <p className="text-red-400 text-sm text-center">{signupError.message}</p>
            )}

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
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
                className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
