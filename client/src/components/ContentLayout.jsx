import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ContentLayout({ title, children }) {
  return (
    <>
      <Helmet>
        <title>{title} — Integration</title>
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
        <Navbar />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl tracking-[0.15em] uppercase mb-5"
              style={{ fontFamily: "var(--font-utility)" }}
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
