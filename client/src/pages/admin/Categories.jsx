import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Backpack,
  BaggageClaim,
  BookOpenText,
  Briefcase,
  Crown,
  Eye,
  EyeOff,
  Footprints,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Shirt,
  ShoppingBag,
  Star,
  Tags,
  TvMinimal,
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
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { uploadImage } from '../../api/upload';
import { CATEGORY_GROUPS } from '../../data/categories';
import { cloudinaryUrl, IMAGE_FALLBACK } from '../../lib/image';

const iconMap = {
  Shirt,
  Shield,
  Crown,
  Footprints,
  ShoppingBag,
  Backpack,
  BaggageClaim,
  Briefcase,
  TvMinimal,
  BookOpenText,
};
const ICON_NAMES = Object.keys(iconMap);

const emptyForm = {
  name: '',
  tag: '',
  group: 'T-Shirts',
  icon: 'Shirt',
  image: '',
  order: '0',
  home: false,
  active: true,
};

const CATEGORY_SORTERS = {
  order_asc: (a, b) =>
    (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
  order_desc: (a, b) =>
    (b.order ?? 0) - (a.order ?? 0) || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isSlug = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export default function Categories() {
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

  const { data: categories, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
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
  } = useListControls(categories, {
    searchText: (category) => [category.name, category.tag, category.group],
    filterKey: statusFilter,
    filterFn: (category) => {
      if (statusFilter === 'active') return category.active;
      if (statusFilter === 'inactive') return !category.active;
      if (statusFilter === 'home') return category.home;
      return true;
    },
    sorters: CATEGORY_SORTERS,
    initialSort: 'order_asc',
    pageSize: 10,
  });

  const isDirty =
    showModal && initialFormRef.current !== null && JSON.stringify(form) !== initialFormRef.current;

  const resolvedTag = form.tag.trim() ? slugify(form.tag) : slugify(form.name);
  const tagChanged = Boolean(editing) && resolvedTag !== editing.tag;
  const IconPreview = iconMap[form.icon] || Shirt;

  const applyServerErrors = (err) => {
    if (!err.fieldErrors) return;
    const next = {};
    for (const [field, messages] of Object.entries(err.fieldErrors)) {
      next[field] = Array.isArray(messages) ? messages[0] : messages;
    }
    setErrors(next);
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      finalizeClose();
      toast({ type: 'success', message: 'Category created successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to create category.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      finalizeClose();
      toast({ type: 'success', message: 'Category updated successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to update category.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
      toast({ type: 'success', message: 'Category deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      toast({ type: 'error', message: err.message || 'Failed to deactivate category.' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id }) => updateCategory(id, { active: true }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminCategories'], (old) =>
        Array.isArray(old)
          ? old.map((category) => (category._id === updated._id ? updated : category))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ type: 'success', message: 'Category activated.' });
    },
    onError: (err) => {
      toast({ type: 'error', message: err.message || 'Failed to activate category.' });
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'integration/categories');
      setForm((prev) => ({ ...prev, image: url }));
      setErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message }));
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

  const openEdit = (category) => {
    const initial = {
      name: category.name,
      tag: category.tag,
      group: category.group,
      icon: ICON_NAMES.includes(category.icon) ? category.icon : 'Shirt',
      image: category.image || '',
      order: String(category.order ?? 0),
      home: category.home === true,
      active: category.active === true,
    };
    setEditing(category);
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
    const name = form.name.trim();
    if (!name) next.name = 'Category name is required.';
    else if (name.length > 50) next.name = 'Name must be 50 characters or fewer.';

    if (!resolvedTag) next.tag = 'Tag is required — enter one or use a name with letters or numbers.';
    else if (!isSlug(resolvedTag)) next.tag = 'Tag can only contain lowercase letters, numbers, and hyphens.';

    if (!form.group.trim()) next.group = 'Group is required.';
    else if (form.group.trim().length > 50) next.group = 'Group must be 50 characters or fewer.';

    const order = form.order === '' ? 0 : Number(form.order);
    if (!Number.isInteger(order) || order < 0) next.order = 'Order must be a whole number of 0 or more.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      tag: resolvedTag,
      group: form.group.trim(),
      icon: ICON_NAMES.includes(form.icon) ? form.icon : 'Shirt',
      image: form.image.trim(),
      order: form.order === '' ? 0 : Number(form.order),
      home: form.home === true,
    };

    setSubmitting(true);
    const options = { onSettled: () => setSubmitting(false) };
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: { ...data, active: form.active === true } }, options);
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
  const displayIcon = (category) => iconMap[category.icon] || Shirt;

  return (
    <>
      <MetaTags
        title="Admin Categories"
        description="Admin dashboard — category management."
        path="/admin/categories"
        noindex
      />

      <AdminPageHeader
        title="Categories"
        description="Curate shop filters, homepage tiles, icons, and display order."
      >
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="uppercase tracking-wider">Add category</span>
        </button>
      </AdminPageHeader>

      <AdminToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search categories by name, tag, or group..."
        searchLabel="Search categories"
        filters={[
          {
            label: 'Filter categories',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All categories' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'home', label: 'On homepage' },
            ],
          },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'order_asc', label: 'Order: low to high' },
          { value: 'order_desc', label: 'Order: high to low' },
          { value: 'name', label: 'Name A–Z' },
          { value: 'newest', label: 'Newest first' },
        ]}
        total={total}
        totalLabel="category"
        totalLabelPlural="categories"
      />

      {isLoading && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]" aria-busy="true">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Category', 'Tag', 'Group', 'Order', 'Home', 'Status', 'Actions'].map((h) => (
                  <th key={h} scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="px-3 py-3"><Skeleton className="h-10 w-36" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-8" /></td>
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

      {categories && filtered.length === 0 && (
        <EmptyState
          icon={Tags}
          message={hasFilters ? 'No categories match your filters' : 'No categories yet. Add one so customers can browse the shop by tag.'}
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={openAdd} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Add category
              </button>
            )
          }
        />
      )}

      {categories && filtered.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
            <table className="w-full text-sm" aria-label="Admin categories">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Category</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Tag</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Group</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Order</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Home</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((category) => {
                  const Icon = displayIcon(category);
                  const pending = activePending(category._id);
                  return (
                    <tr
                      key={category._id}
                      className={`border-b border-[var(--border)]/50 last:border-0 ${!category.active ? 'bg-red-500/[0.03]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
                            {category.image ? (
                              <img
                                src={cloudinaryUrl(category.image, 80)}
                                alt=""
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = IMAGE_FALLBACK;
                                }}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Icon size={18} className="text-[var(--accent)]" aria-hidden="true" />
                            )}
                          </span>
                          <span className="max-w-[220px] truncate text-[var(--text-primary)]">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{category.tag}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{category.group}</td>
                      <td className="px-4 py-3 text-center text-xs text-[var(--text-secondary)]">{category.order ?? 0}</td>
                      <td className="px-4 py-3 text-center">
                        {category.home ? (
                          <>
                            <Star size={14} className="inline fill-amber-400 text-amber-400" aria-hidden="true" />
                            <span className="sr-only">Shown on homepage</span>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--text-secondary)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={category.active ? 'emerald' : 'red'}>
                          {category.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!category.active && (
                            <IconButton
                              label={`Activate ${category.name}`}
                              tone="emerald"
                              disabled={pending}
                              onClick={() => activateMutation.mutate({ id: category._id })}
                            >
                              {pending ? <Spinner size={14} /> : <RefreshCw size={15} aria-hidden="true" />}
                            </IconButton>
                          )}
                          <IconButton
                            label={`Edit ${category.name}`}
                            tone="accent"
                            onClick={() => openEdit(category)}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </IconButton>
                          {category.active && (
                            <IconButton
                              label={`Deactivate ${category.name}`}
                              tone="danger"
                              onClick={() => setDeleteTarget(category)}
                            >
                              <EyeOff size={16} aria-hidden="true" />
                            </IconButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageItems.map((category) => {
              const Icon = displayIcon(category);
              const pending = activePending(category._id);
              return (
                <div key={category._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
                      {category.image ? (
                        <img
                          src={cloudinaryUrl(category.image, 96)}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = IMAGE_FALLBACK;
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon size={20} className="text-[var(--accent)]" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm text-[var(--text-primary)]">{category.name}</p>
                        <StatusBadge tone={category.active ? 'emerald' : 'red'}>
                          {category.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">{category.tag}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {category.group} · Order {category.order ?? 0}
                        {category.home ? ' · Homepage' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    {!category.active && (
                      <button
                        type="button"
                        onClick={() => activateMutation.mutate({ id: category._id })}
                        disabled={pending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                      >
                        <Eye size={14} aria-hidden="true" />
                        Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit
                    </button>
                    {category.active && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-red-500 hover:text-red-400"
                      >
                        <EyeOff size={14} aria-hidden="true" />
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
        title={editing ? 'Edit category' : 'Add category'}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={requestClose} className={`flex-1 ${secondaryButton}`}>
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={submitting || uploading}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                submitting || uploading
                  ? 'cursor-not-allowed bg-[var(--border)] text-[var(--text-secondary)]'
                  : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
              }`}
            >
              {submitting && <Spinner size={14} />}
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create category'}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name}>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={50}
                  placeholder="Hoodies"
                  className={fieldClass}
                />
              )}
            </FormField>

            <FormField
              label="Tag (slug)"
              error={errors.tag}
              helperText={form.tag.trim() ? 'Used in shop filter URLs.' : 'Generated from the name if left empty.'}
            >
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  maxLength={50}
                  placeholder={slugify(form.name) || 'hoodies'}
                  className={`${fieldClass} font-mono`}
                />
              )}
            </FormField>
          </div>

          {tagChanged && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400" role="status">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Changing the tag from <code className="font-mono">{editing.tag}</code> to{' '}
                <code className="font-mono">{resolvedTag || '—'}</code> can detach existing products.
                Update those products&apos; tags to match.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Group" required error={errors.group} helperText="Groups categories into shop sections.">
              {({ id }) => (
                <>
                  <input
                    id={id}
                    type="text"
                    value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                    list="category-groups"
                    maxLength={50}
                    className={fieldClass}
                  />
                  <datalist id="category-groups">
                    {CATEGORY_GROUPS.map((group) => (
                      <option key={group} value={group} />
                    ))}
                  </datalist>
                </>
              )}
            </FormField>

            <FormField label="Order" error={errors.order} helperText="0 appears first.">
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min="0"
                  step="1"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  placeholder="0"
                  className={fieldClass}
                />
              )}
            </FormField>
          </div>

          <FormField label="Icon" helperText="Shown when no homepage image is set.">
            {({ id }) => (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--accent)]">
                  <IconPreview size={18} aria-hidden="true" />
                </span>
                <select
                  id={id}
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className={fieldClass}
                >
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </FormField>

          <FormField
            label="Homepage image"
            error={errors.image}
            helperText={form.image ? 'Shown on the homepage category tile.' : 'Optional — falls back to an icon.'}
          >
            {({ id }) => (
              <div className="space-y-2">
                {form.image && (
                  <div className="aspect-[2.4/1] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
                    <img
                      src={cloudinaryUrl(form.image, 480)}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = IMAGE_FALLBACK;
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] ${
                      uploading ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    {uploading ? <Spinner size={14} /> : <Upload size={14} aria-hidden="true" />}
                    {uploading ? 'Uploading...' : form.image ? 'Replace image' : 'Choose file'}
                  </label>
                  <input
                    id={id}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-red-500 hover:text-red-400"
                    >
                      Remove image
                    </button>
                  )}
                  <span className="text-xs text-[var(--text-secondary)]">2.4:1 recommended.</span>
                </div>
              </div>
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, home: !form.home })}
                role="switch"
                aria-checked={form.home}
                aria-label="Show on homepage"
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.home ? 'bg-amber-500' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    form.home ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-[var(--text-primary)]">Homepage</p>
                <p className="text-xs text-[var(--text-secondary)]">Show this category on the homepage.</p>
              </div>
            </div>

            {editing && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  role="switch"
                  aria-checked={form.active}
                  aria-label="Category active"
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
                  <p className="text-xs text-[var(--text-secondary)]">Inactive categories are hidden from the shop.</p>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate category"
        message={`Deactivate "${deleteTarget?.name}"? It will no longer appear in the shop filters.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        confirmLabel="Deactivate"
        danger
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard changes?"
        message="Your unsaved category changes will be lost."
        onConfirm={finalizeClose}
        confirmLabel="Discard"
        danger
      />
    </>
  );
}
