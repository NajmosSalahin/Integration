import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { verifyEmail } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setError(err.message);
      });
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Verify Email — Integration</title>
      </Helmet>
      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          {status === 'verifying' && (
            <>
              <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                VERIFYING...
              </h1>
              <p className="text-gray-400 text-sm">Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                EMAIL VERIFIED
              </h1>
              <p className="text-gray-400 text-sm">Your email has been verified. You can now use all features.</p>
              <Link to="/" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Go to Home
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-3xl tracking-[0.2em] uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                VERIFICATION FAILED
              </h1>
              <p className="text-gray-400 text-sm">{error || 'Something went wrong'}</p>
              <Link to="/" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Go to Home
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
