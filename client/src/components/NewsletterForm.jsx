import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { subscribeNewsletter } from '../api/newsletter';
import Spinner from './ui/Spinner';

export default function NewsletterForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const successTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(successTimer.current);
  }, []);

  const mutation = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => {
      setSuccess(true);
      setEmail('');
      setError(null);
      successTimer.current = setTimeout(() => setSuccess(false), 6000);
    },
    onError: (err) => {
      const msg = err?.message || '';
      const alreadySubscribed =
        /already/i.test(msg) || /subscri/i.test(msg) && /exist/i.test(msg);
      setError(
        alreadySubscribed
          ? 'You are already subscribed — no action needed.'
          : msg
      );
      setSuccess(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    mutation.mutate(email);
  };

  const id = compact ? 'newsletter-email-compact' : 'newsletter-email';

  if (compact) {
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            id={id}
            type="email"
            required
            placeholder="Your email"
            aria-label="Email address for newsletter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2.5 bg-[var(--accent)] text-[#0e1320] text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-utility)" }}
          >
            {mutation.isPending && <Spinner size={12} />}
            {mutation.isPending ? 'Subscribing' : 'Subscribe'}
          </button>
        </form>
        {success && (
          <p className="text-xs text-green-500 mt-2" role="status">Thanks for subscribing!</p>
        )}
        {error && (
          <p className="text-xs text-red-400 mt-2" role="alert">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3
        className="hand-drawn-underline text-xl mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Join the loop
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        New drops, no spam. Ever.
      </p>

      {success && (
        <p className="text-sm text-green-600 mb-3" role="status">
          Thanks for subscribing!
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mb-3" role="alert">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            id={id}
            type="email"
            required
            placeholder="Your email"
            aria-label="Email address for newsletter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-[var(--accent)] text-[#0e1320] text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-utility)" }}
          >
            {mutation.isPending && <Spinner size={12} />}
            {mutation.isPending ? 'Subscribing' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
}