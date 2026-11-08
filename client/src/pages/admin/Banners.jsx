import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Upload,
} from 'lucide-react';
import MetaTags from '../../components/MetaTags';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminToolbar from '../../components/admin/AdminToolbar';
import IconButton from '../../components/admin/IconButton';
import StatusBadge from '../../components/admin/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormField from '../../components/ui/FormField';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import useListControls from '../../hooks/useListControls';
import { IMAGE_FALLBACK } from '../../lib/image';
import { getAdminBanners, createBanner, updateBanner, deleteBanner } from '../../api/banners';
import { uploadImage } from '../../api/upload';

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

const BANNER_SORTERS = {
  order_asc: (a, b) => (a.order ?? 0) - (b.order ?? 0),
  order_desc: (a, b) => (b.order ?? 0) - (a.order ?? 0),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const isValidCta = (value) =>
  value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://');

export default function Banners() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const initialFormRef = useRef(null);

  const { data: banners, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: getAdminBanners,
  });

  const {
    query,
    setQuery,
    page,
    setPage,
    sort,
    setSort,
    pageItems,
    total,
    totalPages,
    filtered,
  } = useListControls(banners, {
    searchText: (banner) => [banner.label, banner.alt, banner.cta],
    filterKey: statusFilter,
    filterFn: (banner) => {
      if (statusFilter === 'active') return banner.active;
      if (statusFilter === 'inactive') return !banner.active;
      return true;
    },
    sorters: BANNER_SORTERS,
    initialSort: 'order_asc',
    pageSize: 10,
  });

  const isDirty =
    showModal && initialFormRef.current !== null && JSON.stringify(form) !== initialFormRef.current;

  const applyServerErrors = (err) => {
    if (!err.fieldErrors) return;
    const next = {};
    for (const [field, messages] of Object.entries(err.fieldErrors)) {
      next[field] = Array.isArray(messages) ? messages[0] : messages;
    }
    setErrors(next);
  };

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      finalizeClose();
      toast({ type: 'success', message: 'Banner created successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to create banner.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      finalizeClose();
      toast({ type: 'success', message: 'Banner updated successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to update banner.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setDeleteTarget(null);
      toast({ type: 'success', message: 'Banner deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      toast({ type: 'error', message: err.message || 'Failed to deactivate banner.' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id }) => updateBanner(id, { active: true }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminBanners'], (old) =>
        Array.isArray(old)
          ? old.map((banner) => (banner._id === updated._id ? updated : banner))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ type: 'success', message: 'Banner activated.' });
    },
    onError: (err) => {
      toast({ type: 'error', message: err.message || 'Failed to activate banner.' });
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicId } = await uploadImage(file, 'integration/banners');
      setForm((prev) => ({ ...prev, publicId }));
      setErrors((prev) => ({ ...prev, publicId: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, publicId: err.message }));
      toast({ type: 'error', message: err.message || 'Image upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openAdd = () => {
    const initial = { ...emptyForm };
    setEditing(null);
    setForm(initial);
    initialFormRef.current = JSON.stringify(initial);
    setErrors({});
    setFormError(null);
    setDiscardOpen(false);
    setShowModal(true);
  };

  const openEdit = (banner) => {
    const initial = {
      publicId: banner.publicId,
      label: banner.label,
      alt: banner.alt,
      cta: banner.cta,
      order: String(banner.order),
      active: banner.active,
    };
    setEditing(banner);
    setForm(initial);
    initialFormRef.current = JSON.stringify(initial);
    setErrors({});
    setFormError(null);
    setDiscardOpen(false);
    setShowModal(true);
  };

  const finalizeClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormError(null);
    initialFormRef.current = null;
    setDiscardOpen(false);
  };

  const requestClose = () => {
    if (submitting || uploading) return;
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    finalizeClose();
  };

  const validate = () => {
    const next = {};
    if (!form.publicId) next.publicId = 'Upload a banner image first.';

    const order = form.order === '' ? 0 : Number(form.order);
    if (!Number.isInteger(order) || order < 0) next.order = 'Order must be a whole number of 0 or more.';

    const cta = form.cta.trim();
    if (!cta) next.cta = 'Link is required.';
    else if (!isValidCta(cta)) next.cta = 'Use a path starting with / or a full http(s) URL.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const data = {
      publicId: form.publicId,
      label: form.label.trim(),
      alt: form.alt.trim(),
      cta: form.cta.trim() || '/shop',
      order: form.order === '' ? 0 : Number(form.order),
      active: form.active === true,
    };

    setSubmitting(true);
    const options = { onSettled: () => setSubmitting(false) };
    if (editing) {
      updateMutation.mutate({ id: editing._id, data }, options);
    } else {
      createMutation.mutate(data, options);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasFilters = Boolean(query || statusFilter !== 'all');
  const activePending = (id) => activateMutation.isPending && activateMutation.variables?.id === id;

  return (
    <>
      <MetaTags
        title="Admin Banners"
        description="Admin dashboard — homepage banner management."
        path="/admin/banners"
        noindex
      />

      <AdminPageHeader
        title="Banners"
        description="Control the homepage hero carousel, links, order, and visibility."
      >
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="uppercase tracking-wider">Add banner</span>
        </button>
      </AdminPageHeader>

      <AdminToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search banners by label, alt text, or link..."
        searchLabel="Search banners"
        filters={[
          {
            label: 'Filter banners',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All banners' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'order_asc', label: 'Order: low to high' },
          { value: 'order_desc', label: 'Order: high to low' },
          { value: 'newest', label: 'Newest first' },
        ]}
        total={total}
        totalLabel="banner"
      />

      {isLoading && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]" aria-busy="true">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['', 'Label', 'CTA', 'Order', 'Status', 'Actions'].map((h) => (
                  <th key={h} scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="px-3 py-3"><Skeleton className="h-14 w-24 rounded-lg" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3"><Skeleton className="ml-auto h-8 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fetchError && <ErrorState message={fetchError.message} onRetry={refetch} />}

      {banners && filtered.length === 0 && (
        <EmptyState
          icon={ImageIcon}
          message={hasFilters ? 'No banners match your filters' : 'No banners yet. Add a banner image to feature it at the top of the homepage.'}
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={openAdd} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Add banner
              </button>
            )
          }
        />
      )}

      {banners && filtered.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
            <table className="w-full text-sm" aria-label="Admin banners">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="w-32 px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal"></th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Label</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Link</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Order</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((banner) => (
                  <tr key={banner._id} className={`border-b border-[var(--border)]/50 last:border-0 ${!banner.active ? 'bg-red-500/[0.03]' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="h-14 w-28 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                        <img
                          src={bannerImg(banner.publicId, 240)}
                          alt={banner.alt || banner.label || ''}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = IMAGE_FALLBACK;
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[220px] truncate text-[var(--text-primary)]">{banner.label || '—'}</p>
                      {banner.alt && <p className="max-w-[220px] truncate text-xs text-[var(--text-secondary)]">{banner.alt}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block max-w-[220px] truncate text-xs text-[var(--text-secondary)]">{banner.cta}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--text-secondary)]">{banner.order}</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={banner.active ? 'emerald' : 'neutral'}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!banner.active && (
                          <IconButton
                            label={`Activate banner ${banner.label || ''}`}
                            tone="emerald"
                            disabled={activePending(banner._id)}
                            onClick={() => activateMutation.mutate({ id: banner._id })}
                          >
                            {activePending(banner._id) ? <Spinner size={14} /> : <RefreshCw size={15} aria-hidden="true" />}
                          </IconButton>
                        )}
                        <IconButton
                          label={`Edit banner ${banner.label || ''}`}
                          tone="accent"
                          onClick={() => openEdit(banner)}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </IconButton>
                        {banner.active && (
                          <IconButton
                            label={`Deactivate banner ${banner.label || ''}`}
                            tone="danger"
                            onClick={() => setDeleteTarget(banner)}
                          >
                            <EyeOff size={16} aria-hidden="true" />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageItems.map((banner) => (
              <div key={banner._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <div className="flex gap-3">
                  <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-primary)]">
                    <img
                      src={bannerImg(banner.publicId, 240)}
                      alt={banner.alt || banner.label || ''}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = IMAGE_FALLBACK;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm text-[var(--text-primary)]">{banner.label || '—'}</p>
                      <StatusBadge tone={banner.active ? 'emerald' : 'neutral'}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">{banner.cta}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">Order {banner.order}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  {!banner.active && (
                    <button
                      type="button"
                      onClick={() => activateMutation.mutate({ id: banner._id })}
                      disabled={activePending(banner._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                    >
                      <Eye size={14} aria-hidden="true" />
                      Activate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(banner)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Edit
                  </button>
                  {banner.active && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(banner)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-red-500 hover:text-red-400"
                    >
                      <EyeOff size={14} aria-hidden="true" />
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination current={page} total={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}

      <Modal
        open={showModal}
        onClose={discardOpen ? () => setDiscardOpen(false) : requestClose}
        title={editing ? 'Edit banner' : 'Add banner'}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={requestClose} className={`flex-1 ${secondaryButton}`}>
              Cancel
            </button>
            <button
              type="submit"
              form="banner-form"
              disabled={submitting || uploading}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                submitting || uploading
                  ? 'cursor-not-allowed bg-[var(--border)] text-[var(--text-secondary)]'
                  : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
              }`}
            >
              {submitting && <Spinner size={14} />}
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create banner'}
            </button>
          </div>
        }
      >
        <form id="banner-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          )}

          <FormField label="Banner image" required error={errors.publicId}>
            {({ id }) => (
              <div className="space-y-2">
                {form.publicId && (
                  <div className="aspect-[2.4/1] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
                    <img
                      src={bannerImg(form.publicId, 640)}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = IMAGE_FALLBACK;
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] ${
                      uploading ? 'pointer-events-none opacity-50' : ''
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Button label" error={errors.label}>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  maxLength={80}
                  placeholder="Shop new collection"
                  className={fieldClass}
                />
              )}
            </FormField>

            <FormField label="Alt text" error={errors.alt} helperText="Describe the image for screen readers.">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.alt}
                  onChange={(e) => setForm({ ...form, alt: e.target.value })}
                  maxLength={200}
                  placeholder="New collection"
                  className={fieldClass}
                />
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Link" error={errors.cta} helperText="Use /shop or a full https:// link.">
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

            <FormField label="Order" error={errors.order} helperText="0 appears first.">
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  min="0"
                  placeholder="0"
                  className={fieldClass}
                />
              )}
            </FormField>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              role="switch"
              aria-checked={form.active}
              aria-label="Banner active"
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                form.active ? 'bg-emerald-600' : 'bg-[var(--border)]'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  form.active ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
            <div>
              <p className="text-sm text-[var(--text-primary)]">Active</p>
              <p className="text-xs text-[var(--text-secondary)]">Inactive banners are hidden from the homepage.</p>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate banner"
        message="Deactivate this banner? It will no longer appear on the homepage."
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        confirmLabel="Deactivate"
        danger
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard changes?"
        message="Your unsaved banner changes will be lost."
        onConfirm={finalizeClose}
        confirmLabel="Discard"
        danger
      />
    </>
  );
}
