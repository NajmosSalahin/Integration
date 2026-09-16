import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Integration</title>
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center px-4">
        <h1
          className="text-8xl sm:text-9xl tracking-[0.2em] text-[var(--accent)]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          404
        </h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">Page not found</p>
        <Link
          to="/"
          className="mt-8 px-6 py-3 bg-[var(--accent-hover)] hover:bg-[var(--accent)] text-white text-sm tracking-[0.2em] uppercase rounded-sm transition-colors"
        >
          Back to Collection
        </Link>
      </div>
    </>
  );
}
