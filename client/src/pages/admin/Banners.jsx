import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaTags from '../../components/MetaTags';
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { getAdminBanners, createBanner, updateBanner, deleteBanner } from '../../api/banners';
import { uploadImage } from '../../api/upload';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormField from '../../components/ui/FormField';
import Spinner from '../../components/ui/Spinner';

const CLOUD_BASE = 'https://res.cloudinary.com/zo1t9pye/image/upload';

const bannerImg = (publicId, width) => `${CLOUD_BASE}/f_auto,q_auto,w_${width}/${publicId}`;

const emptyForm = {
  publicId: '',
  label: '',
  alt: '',
  cta: '/shop',
  order: '',
  active: true,
};

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none';

export default function Banners() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: banners, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: getAdminBanners,
  });

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      closeModal();
      setToast({ type: 'success', message: 'Banner created successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      closeModal();
      setToast({ type: 'success', message: 'Banner updated successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Banner deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      setToast({ type: 'error', message: err.message || 'Failed to deactivate banner.' });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setForm({
      publicId: banner.publicId,
      label: banner.label,
      alt: banner.alt,
      cta: banner.cta,
      order: String(banner.order),
      active: banner.active,
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { publicId } = await uploadImage(file, 'integration/banners');
      setForm((prev) => ({ ...prev, publicId }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.publicId) {
      setError('Upload a banner image first.');
      return;
    }

    const order = form.order === '' ? 0 : parseInt(form.order, 10);
    if (Number.isNaN(order) || order < 0) {
      setError('Order must be 0 or more.');
      return;
    }

    const data = {
      publicId: form.publicId,
      label: form.label.trim(),
      alt: form.alt.trim(),
      cta: form.cta.trim() || '/shop',
      order,
      active: form.active === true,
    };

    if (editing) {
      updateMutation.mutate({ id: editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <MetaTags title="Admin Banners" description="Admin dashboard — homepage banner management." path="/admin/banners" noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h1
                className="text-2xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Admin — Banners
              </h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
              >
                <Plus size={16} aria-hidden="true" />
                <span className="tracking-wider uppercase">Add Banner</span>
              </button>
            </div>

            {isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['', 'Label', 'CTA', 'Order', 'Status', 'Actions'].map((h) => (
                        <th key={h} className={`text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal ${h === 'CTA' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50">
                        <td className="py-3 px-3"><Skeleton className="w-24 h-14 rounded-lg" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-32 h-4" /></td>
                        <td className="py-3 px-3 hidden sm:table-cell"><Skeleton className="w-24 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-8 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-8 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4 ml-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {fetchError && <ErrorState message={fetchError.message} onRetry={refetch} />}

            {banners && banners.length === 0 && (
              <EmptyState
                icon={ImageIcon}
                title="No banners yet"
                description="Add a banner image to feature it at the top of the homepage."
                action={
                  <button onClick={openAdd} className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
                    Add Banner
                  </button>
                }
              />
            )}

            {banners && banners.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Admin banners">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal w-28"></th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Label</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden sm:table-cell">CTA</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Order</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Status</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr
                        key={banner._id}
                        className={`border-b border-[var(--border)]/50 ${!banner.active ? 'opacity-50' : 'hover:bg-[var(--bg-secondary)]'}`}
                      >
                        <td className="py-3 px-3">
                          <div className="w-28 h-14 bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
                            <img src={bannerImg(banner.publicId, 240)} alt={banner.alt || banner.label} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-[var(--text-primary)] truncate max-w-[200px]">{banner.label || '—'}</p>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className="text-[var(--text-secondary)] text-xs truncate max-w-[160px] inline-block">{banner.cta}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[var(--text-secondary)] text-xs">{banner.order}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs ${banner.active ? 'text-emerald-400' : 'text-red-400'}`}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(banner)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                              title="Edit"
                              aria-label={`Edit ${banner.label || 'banner'}`}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(banner)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                              title="Deactivate"
                              aria-label={`Deactivate ${banner.label || 'banner'}`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {showModal && (
        <Modal open={showModal} onClose={closeModal} title={editing ? 'Edit Banner' : 'Add Banner'}>
          <form onSubmit={handleSubmit} className="space-y-3 mt-1">
            <FormField label="Banner image" required>
              {({ id }) => (
                <div className="space-y-2">
                  {form.publicId && (
                    <div className="w-full aspect-[2.4/1] bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
                      <img src={bannerImg(form.publicId, 480)} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={id}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer ${
                        uploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {uploading ? <Spinner size={14} /> : <Upload size={14} aria-hidden="true" />}
                      {uploading ? 'Uploading...' : form.publicId ? 'Replace image' : 'Choose file'}
                    </label>
                    <input
                      id={id}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="sr-only"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">16:5 recommended, max 5 MB.</span>
                  </div>
                </div>
              )}
            </FormField>

            <FormField label="Button label">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  maxLength={80}
                  placeholder="Shop New Collection"
                  className={fieldClass}
                />
              )}
            </FormField>

            <FormField label="Alt text">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  maxLength={200}
                  placeholder="New Collection"
                  className={fieldClass}
                />
              )}
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Link (CTA)">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.cta}
                    onChange={(e) => setForm({ ...form, cta: e.target.value })}
                    maxLength={200}
                    placeholder="/shop"
                    className={fieldClass}
                  />
                )}
              </FormField>

              <FormField label="Order (0 = first)">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    min="0"
                    className={fieldClass}
                  />
                )}
              </FormField>
            </div>

            <FormField label="Status">
              {({ id }) => (
                <div className="flex items-center gap-2">
                  <button
                    id={id}
                    type="button"
                    onClick={() => setForm({ ...form, active: !form.active })}
                    role="switch"
                    aria-checked={form.active}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.active ? 'bg-emerald-600' : 'bg-[var(--border)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        form.active ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[var(--text-secondary)]">{form.active ? 'Active' : 'Inactive'}</span>
                </div>
              )}
            </FormField>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-sm text-red-400 flex items-start gap-2" role="alert">
                <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2 border border-[var(--border)] text-[var(--text-secondary)] text-sm rounded-lg hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors inline-flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-[var(--border)] text-[var(--text-secondary)] cursor-not-allowed'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white cursor-pointer'
                }`}
              >
                {isSubmitting && <Spinner size={14} />}
                {isSubmitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Deactivate Banner"
          message={`Deactivate this banner? It will no longer appear on the homepage.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
          confirmLabel="Deactivate"
          danger
          loading={deleteMutation.isPending}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-lg animate-[fade-in_0.2s_ease] ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 border border-emerald-700 text-emerald-300'
              : 'bg-red-900/90 border border-red-700 text-red-300'
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </>
  );
}