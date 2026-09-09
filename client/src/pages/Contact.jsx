import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ContentLayout from '../components/ContentLayout';
import { submitContact } from '../api/contact';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitContact(form);
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title="Contact Us">
      <div className="space-y-6">
        <p className="text-gray-400 leading-relaxed">
          Have a question about an order, a product, or just want to say hello?
          Fill out the form below and we will get back to you as soon as possible.
        </p>

        {success && (
          <div className="p-4 border border-green-500/30 bg-green-500/10 rounded-sm">
            <p className="text-green-400 text-sm">
              Your message has been sent. We will get back to you shortly.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-sm">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">
              Message
            </label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-sm text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
              className="px-8 py-2.5 bg-[var(--accent)] hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </ContentLayout>
  );
}
