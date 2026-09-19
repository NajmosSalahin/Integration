import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shirt, Shield, Crown, Footprints, ShoppingBag, Backpack, BaggageClaim, Briefcase, TvMinimal, BookOpenText } from 'lucide-react';
import MetaTags from '../../components/MetaTags';
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormField from '../../components/ui/FormField';
import Spinner from '../../components/ui/Spinner';
import { CATEGORY_GROUPS } from '../../data/categories';

const iconMap = { Shirt, Shield, Crown, Footprints, ShoppingBag, Backpack, BaggageClaim, Briefcase, TvMinimal, BookOpenText };
const ICON_NAMES = Object.keys(iconMap);

const emptyForm = {
  name: '',
  tag: '',
  group: 'T-Shirts',
  icon: 'Shirt',
  home: false,
  active: true,
};

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none';

export default function Categories() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: categories, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      closeModal();
      setToast({ type: 'success', message: 'Category created successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      closeModal();
      setToast({ type: 'success', message: 'Category updated successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Category deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      setToast({ type: 'error', message: err.message || 'Failed to deactivate category.' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id }) => updateCategory(id, { active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      setToast({ type: 'success', message: 'Category activated.' });
    },
    onError: (err) => {
      setToast({ type: 'error', message: err.message || 'Failed to activate category.' });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      tag: category.tag,
      group: category.group,
      icon: category.icon || 'Shirt',
      home: category.home,
      active: category.active,
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

  const slugify = (s) =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    const tag = form.tag.trim() ? slugify(form.tag) : slugify(name);
    if (!name) {
      setError('Category name is required.');
      return;
    }
    if (!tag) {
      setError('Category tag is invalid.');
      return;
    }
    if (!form.group.trim()) {
      setError('Group is required.');
      return;
    }

    const data = {
      name,
      tag,
      group: form.group.trim(),
      icon: ICON_NAMES.includes(form.icon) ? form.icon : 'Shirt',
      home: form.home === true,
    };

    if (editing) {
      updateMutation.mutate({ id: editing._id, data: { ...data, active: form.active === true } });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <MetaTags title="Admin Categories" description="Admin dashboard — category management." path="/admin/categories" noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h1
                className="text-2xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Admin — Categories
              </h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
              >
                <Plus size={16} aria-hidden="true" />
                <span className="tracking-wider uppercase">Add Category</span>
              </button>
            </div>

            {isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Name', 'Tag', 'Group', 'Featured', 'Status', 'Actions'].map((h) => (
                        <th key={h} className={`text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal ${h === 'Tag' || h === 'Group' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50">
                        <td className="py-3 px-3"><Skeleton className="w-32 h-4" /></td>
                        <td className="py-3 px-3 hidden sm:table-cell"><Skeleton className="w-24 h-4" /></td>
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

            {categories && categories.length === 0 && (
              <EmptyState
                icon={Star}
                title="No categories yet"
                description="Add categories so customers can browse the shop by tag."
                action={
                  <button onClick={openAdd} className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
                    Add Category
                  </button>
                }
              />
            )}

            {categories && categories.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Admin categories">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Name</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden sm:table-cell">Tag</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden md:table-cell">Group</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Home</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Status</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => {
                      const Icon = iconMap[category.icon];
                      return (
                        <tr
                          key={category._id}
                          className={`border-b border-[var(--border)]/50 ${!category.active ? 'opacity-50' : 'hover:bg-[var(--bg-secondary)]'}`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {Icon && <Icon size={16} className="text-[var(--accent)] shrink-0" aria-hidden="true" />}
                              <span className="text-[var(--text-primary)] truncate max-w-[200px]">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 hidden sm:table-cell">
                            <span className="text-[var(--text-secondary)] text-xs">{category.tag}</span>
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className="text-[var(--text-secondary)] text-xs">{category.group}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {category.home ? (
                              <Star size={14} className="inline text-amber-400 fill-amber-400" aria-label="Shown on homepage" />
                            ) : (
                              <span className="text-[var(--text-secondary)] text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-xs ${category.active ? 'text-emerald-400' : 'text-red-400'}`}>
                              {category.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end gap-2">
                              {!category.active && (
                                <button
                                  onClick={() => activateMutation.mutate({ id: category._id })}
                                  disabled={activateMutation.isPending}
                                  className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors disabled:opacity-50"
                                  title="Activate"
                                  aria-label={`Activate ${category.name}`}
                                >
                                  <CheckCircle size={14} aria-hidden="true" />
                                </button>
                              )}
                              <button
                                onClick={() => openEdit(category)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                                title="Edit"
                                aria-label={`Edit ${category.name}`}
                              >
                                <Pencil size={14} aria-hidden="true" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(category)}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                title="Deactivate"
                                aria-label={`Deactivate ${category.name}`}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {showModal && (
        <Modal open={showModal} onClose={closeModal} title={editing ? 'Edit Category' : 'Add Category'}>
          <form onSubmit={handleSubmit} className="space-y-3 mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Name" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    maxLength={50}
                    placeholder="Hoodies"
                    className={fieldClass}
                  />
                )}
              </FormField>

              <FormField label="Tag (slug)" helperText={!form.tag.trim() ? 'Generated from name if left empty' : null}>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    maxLength={50}
                    placeholder="hoodies"
                    className={fieldClass}
                  />
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Group" required>
                {({ id }) => (
                  <>
                    <input
                      id={id}
                      type="text"
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      list="category-groups"
                      required
                      maxLength={50}
                      className={fieldClass}
                    />
                    <datalist id="category-groups">
                      {CATEGORY_GROUPS.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </>
                )}
              </FormField>

              <FormField label="Icon">
                {({ id }) => (
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
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Show on homepage">
                {({ id }) => (
                  <div className="flex items-center gap-2">
                    <button
                      id={id}
                      type="button"
                      onClick={() => setForm({ ...form, home: !form.home })}
                      role="switch"
                      aria-checked={form.home}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.home ? 'bg-amber-500' : 'bg-[var(--border)]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                          form.home ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-[var(--text-secondary)]">{form.home ? 'Shown' : 'Hidden'}</span>
                  </div>
                )}
              </FormField>

              {editing && (
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
              )}
            </div>

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
          title="Deactivate Category"
          message={`Deactivate "${deleteTarget.name}"? It will no longer appear in the shop filters.`}
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