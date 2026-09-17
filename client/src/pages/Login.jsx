import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors pr-10';

  return (
    <>
      <MetaTags title="Login" description="Sign in to your Integration account." path="/login" noindex />
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <Link to="/" className="text-2xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              INTEGRATION
            </Link>
            <h1
              className="mt-2 text-2xl tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              LOG IN
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

            <FormField label="Email" required>
              {({ id }) => (
                <input
                  id={id}
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                  className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              )}
            </FormField>

            <FormField label="Password" required>
              {({ id }) => (
                <div className="relative">
                  <input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange('password')}
                    autoComplete="current-password"
                    className={inputClass}
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

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading && <Spinner size={15} />}
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[var(--accent)] hover:text-blue-400 transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}