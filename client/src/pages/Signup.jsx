import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MetaTags from '../components/MetaTags';
import { AlertCircle, Eye, EyeOff, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
];

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(form.password),
  }));
  const passwordValid = passwordChecks.every((r) => r.passed);
  const passwordsMatch = form.password === form.confirmPassword;
  const showMismatch = touched.confirmPassword && !passwordsMatch;

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) {
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signup(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
        <div className="max-w-md w-full text-center space-y-3">
          <CheckCircle size={48} className="mx-auto text-emerald-500" aria-hidden="true" />
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CHECK YOUR EMAIL
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            We sent a verification link to <span className="text-[var(--text-primary)]">{form.email}</span>.
            Click the link to verify your account.
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Can't find it? Check your spam or junk folder.
          </p>
          <Link
            to="/login"
            className="inline-block mt-2 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  const baseInputClass =
    'w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors';

  return (
    <>
      <MetaTags title="Sign Up" description="Create an Integration account to place orders and track your purchases." path="/signup" noindex />
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1
              className="mt-2 text-2xl tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              CREATE ACCOUNT
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {error && (
              <div
                className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-400 flex items-start gap-2"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {error}
              </div>
            )}

            <FormField label="Name" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  autoComplete="name"
                  className={baseInputClass}
                />
              )}
            </FormField>

            <FormField label="Email" required>
              {({ id }) => (
                <input
                  id={id}
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                  className={baseInputClass}
                />
              )}
            </FormField>

            <FormField
              label="Password"
              required
              error={touched.password && !passwordValid ? 'Password does not meet the requirements below.' : null}
            >
              {({ id, ...rest }) => (
                <div className="relative">
                  <input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => {
                      handleChange('password')(e);
                      setTouched((t) => ({ ...t, password: true }));
                    }}
                    autoComplete="new-password"
                    {...rest}
                    className={`${baseInputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </FormField>

            {form.password && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1" aria-label="Password requirements">
                {passwordChecks.map((rule) => (
                  <li
                    key={rule.key}
                    className={`text-[11px] flex items-center gap-1.5 ${
                      rule.passed ? 'text-emerald-500' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    <CheckCircle
                      size={12}
                      aria-hidden="true"
                      className={rule.passed ? '' : 'opacity-50'}
                    />
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            <FormField
              label="Confirm Password"
              required
              error={showMismatch ? 'Passwords do not match.' : null}
            >
              {({ id, ...rest }) => (
                <div className="relative">
                  <input
                    id={id}
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => {
                      handleChange('confirmPassword')(e);
                      setTouched((t) => ({ ...t, confirmPassword: true }));
                    }}
                    autoComplete="new-password"
                    aria-invalid={showMismatch || undefined}
                    {...rest}
                    className={`${baseInputClass} pr-10 ${showMismatch ? 'border-red-500/60' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? (
                      <EyeOff size={16} aria-hidden="true" />
                    ) : (
                      <Eye size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading && <Spinner size={15} />}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:text-blue-400 transition-colors">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}