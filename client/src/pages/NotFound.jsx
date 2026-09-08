import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Integration</title>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex flex-col items-center justify-center px-4">
        <h1
          className="text-8xl sm:text-9xl tracking-[0.2em] text-blue-500"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          404
        </h1>
        <p className="mt-4 text-lg text-gray-400">Page not found</p>
        <Link
          to="/"
          className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm tracking-[0.2em] uppercase rounded-sm transition-colors"
        >
          Back to Collection
        </Link>
      </div>
    </>
  );
}
