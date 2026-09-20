import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MetaTags from '../components/MetaTags';
import { AlertCircle, Mail } from 'lucide-react';
import { forgotPassword } from '../api/auth';
import FormField from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';

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
      setError(err.message || 'Could not send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4"
        role="status"
      >
        <div className="max-w-md w-full text-center space-y-4">
          <Mail size={48} className="mx-auto text-[var(--accent)]" aria-hidden="true" />
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CHECK YOUR EMAIL
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            If an account exists with <span className="text-[var(--text-primary)]">{email}</span>, we sent a
            password reset link. Be sure to check your spam folder.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <MetaTags title="Forgot Password" description="Reset your Integration password via email." path="/forgot-password" noindex />
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1
              className="mt-4 text-2xl tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              FORGOT PASSWORD
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-400 flex items-start gap-2"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {error}
              </div>
            )}

            <FormField label="Email" required>
              {({ id }) => (
                <input
                  id={id}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              )}
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading && <Spinner size={15} />}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Remember your password?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:text-blue-400 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}