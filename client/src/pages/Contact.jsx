import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import ContentLayout from '../components/ContentLayout';
import { submitContact } from '../api/contact';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';

const MAX_MESSAGE = 500;

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitContact(form);
      setSuccess(true);
      setForm((f) => ({ ...f, message: '' }));
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim() && !loading;

  return (
    <ContentLayout title="Contact Us">
      <div className="space-y-6">
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Have a question about an order, a product, or just want to say hello?
          Fill out the form below and we will get back to you as soon as possible.
        </p>

        {success && (
          <div className="p-4 border border-emerald-500/40 bg-emerald-500/20 rounded-lg flex items-start gap-2" role="status">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
            <p className="text-emerald-400 text-sm">
              Your message has been sent. We will get back to you shortly.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-500/40 bg-red-500/20 rounded-lg flex items-start gap-2" role="alert">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  autoComplete="name"
                  className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              )}
            </FormField>

            <FormField label="Email" required>
              {({ id }) => (
                <input
                  id={id}
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                  className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              )}
            </FormField>
          </div>

          <FormField label="Message" required>
            {({ id }) => (
              <div>
                <textarea
                  id={id}
                  required
                  rows={6}
                  maxLength={MAX_MESSAGE}
                  value={form.message}
                  onChange={handleChange('message')}
                  className="w-full px-3 py-2.5 bg-[#111] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                  {form.message.length}/{MAX_MESSAGE}
                </p>
              </div>
            )}
          </FormField>

          <button
            type="submit"
            disabled={!canSubmit}
            className="px-8 py-2.5 bg-[var(--accent)] hover:bg-blue-500 disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] text-white text-sm tracking-[0.2em] uppercase rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading && <Spinner size={15} />}
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </ContentLayout>
  );
}