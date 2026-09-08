import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Footer from './Footer';

export default function ContentLayout({ title, children }) {
  return (
    <>
      <Helmet>
        <title>{title} — Integration</title>
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] flex flex-col">
        <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="tracking-wider uppercase">Collection</span>
            </Link>
            <Link
              to="/"
              className="text-lg tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              INTEGRATION
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-3xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-8"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {title}
            </h1>
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
