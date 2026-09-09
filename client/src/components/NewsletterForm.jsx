import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { subscribeNewsletter } from '../api/newsletter';

export default function NewsletterForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => {
      setSuccess(true);
      setEmail('');
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      setSuccess(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);
    mutation.mutate(email);
  };

  if (compact) {
    return (
      <div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[#111] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2.5 bg-[var(--accent)] text-white text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-utility)" }}
          >
            {mutation.isPending ? '...' : 'Subscribe'}
          </button>
        </form>
        {success && (
          <p className="text-xs text-green-500 mt-2">Thanks for subscribing!</p>
        )}
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
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
        <p className="text-sm text-green-600 mb-3">
          Thanks for subscribing!
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-[var(--accent)] text-white text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-utility)" }}
          >
            {mutation.isPending ? 'Sending...' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
}
