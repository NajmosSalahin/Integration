import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { verifyEmail } from '../api/auth';
import Spinner from '../components/ui/Spinner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided.');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Verify Email — Integration</title>
      </Helmet>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4" role="status">
          {status === 'verifying' && (
            <>
              <Spinner size={40} className="mx-auto text-[var(--accent)]" />
              <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                VERIFYING...
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <CheckCircle size={48} className="mx-auto text-emerald-500" aria-hidden="true" />
              <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                EMAIL VERIFIED
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                Your email has been verified. You can now use all features.
              </p>
              <Link
                to="/"
                className="inline-block mt-4 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
              >
                Go to Home
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <AlertCircle size={48} className="mx-auto text-red-500" aria-hidden="true" />
              <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                VERIFICATION FAILED
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">{error || 'Something went wrong.'}</p>
              <Link
                to="/"
                className="inline-block mt-4 text-sm text-[var(--accent)] hover:text-blue-400 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}