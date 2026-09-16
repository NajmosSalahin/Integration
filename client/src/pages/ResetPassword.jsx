import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, CheckCircle, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { resetPassword } from '../api/auth';
import FormField from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(redirectTimer.current);
  }, []);

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
      setTouched({ password: true, confirmPassword: true });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ token, password: form.password, confirmPassword: form.confirmPassword });
      setSuccess(true);
      redirectTimer.current = setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Could not reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <TriangleAlert size={48} className="mx-auto text-yellow-500" aria-hidden="true" />
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            INVALID LINK
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            This password reset link is invalid or missing a token.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block mt-4 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4" role="status">
          <CheckCircle size={48} className="mx-auto text-emerald-500" aria-hidden="true" />
          <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            PASSWORD RESET
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Your password has been reset. Redirecting to login...
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const baseInputClass =
    'w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors pr-10';

  return (
    <>
      <Helmet>
        <title>Reset Password — Integration</title>
      </Helmet>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1 className="mt-4 text-2xl tracking-[0.15em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              RESET PASSWORD
            </h1>
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

            <FormField
              label="New Password"
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
                    className={baseInputClass}
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
                    className={`${baseInputClass} ${showMismatch ? 'border-red-500/60' : ''}`}
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
              className="w-full py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading && <Spinner size={15} />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}