import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaTags from '../../components/MetaTags';
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Star, Upload } from 'lucide-react';
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct, toggleStock, setProductActive } from '../../api/products';
import { uploadImage } from '../../api/upload';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { cloudinaryUrl } from '../../lib/image';
import FormField from '../../components/ui/FormField';
import Spinner from '../../components/ui/Spinner';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  images: '',
  sizes: [],
  sizeGuideNote: '',
  tags: '',
  featured: false,
};

export default function Products() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAllProductsAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      closeModal();
      setToast({ type: 'success', message: 'Product created successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      closeModal();
      setToast({ type: 'success', message: 'Product updated successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Product deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      setToast({ type: 'error', message: err.message || 'Failed to deactivate product.' });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, size, inStock }) => toggleStock(id, size, inStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: (err) => {
      setToast({ type: 'error', message: err.message || 'Failed to toggle stock.' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id, active }) => setProductActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setToast({ type: 'success', message: 'Product activated.' });
    },
    onError: (err) => {
      setToast({ type: 'error', message: err.message || 'Failed to activate product.' });
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file, 'integration/products');
      setForm((prev) => ({
        ...prev,
        images: prev.images ? `${prev.images.trim()}, ${url}` : url,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      images: product.images.join(', '),
      sizes: product.sizes,
      sizeGuideNote: product.sizeGuideNote || '',
      tags: product.tags.join(', '),
      featured: product.featured === true,
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

  const toggleSize = (size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = form.title.trim();
    if (trimmedTitle.length > 100) {
      setError('Title must be 100 characters or fewer.');
      return;
    }

    const price = parseInt(form.price, 10);
    if (!price || price < 1) {
      setError('Price must be at least ৳1.');
      return;
    }

    const imageUrls = form.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const invalidUrl = imageUrls.find((u) => !u.startsWith('http://') && !u.startsWith('https://'));
    if (invalidUrl) {
      setError(`Invalid image URL: ${invalidUrl}`);
      return;
    }

    if (form.sizes.length === 0) {
      setError('Select at least one size.');
      return;
    }

    const data = {
      title: trimmedTitle,
      description: form.description.trim(),
      price,
      images: imageUrls,
      sizes: form.sizes,
      sizeGuideNote: form.sizeGuideNote.trim(),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      featured: form.featured === true,
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
      <MetaTags title="Admin Products" description="Admin dashboard — product management." path="/admin/products" noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h1
                className="text-2xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Admin — Products
              </h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
              >
                <Plus size={16} aria-hidden="true" />
                <span className="tracking-wider uppercase">Add Product</span>
              </button>
            </div>

            {isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['', 'Title', 'Price', 'Sizes', 'Stock', 'Active', 'Actions'].map((h) => (
                        <th key={h} className={`text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal ${['Sizes', 'Stock'].includes(h) ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50">
                        <td className="py-3 px-3"><Skeleton className="w-10 h-10 rounded-lg" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-32 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4" /></td>
                        <td className="py-3 px-3 hidden sm:table-cell"><Skeleton className="w-24 h-4" /></td>
                        <td className="py-3 px-3 hidden sm:table-cell"><Skeleton className="w-28 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-8 h-4 mx-auto" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4 ml-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {fetchError && <ErrorState message={fetchError.message} onRetry={refetch} />}

            {products && products.length === 0 && (
              <EmptyState
                icon={Plus}
                title="No products yet"
                description="Add your first product to get started."
                action={
                  <button onClick={openAdd} className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
                    Add Product
                  </button>
                }
              />
            )}

            {products && products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Admin products">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal w-12"></th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Title</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Price</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden sm:table-cell">Sizes</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden md:table-cell">Stock</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Active</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className={`border-b border-[var(--border)]/50 ${!product.active ? 'opacity-50' : 'hover:bg-[var(--bg-secondary)]'}`}
                      >
                        <td className="py-3 px-3">
                          <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
                            <img src={cloudinaryUrl(product.images[0], 120)} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-[var(--text-primary)] truncate max-w-[150px] sm:max-w-[200px] inline-flex items-center gap-1.5">
                            {product.featured && (
                              <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" aria-label="Featured" />
                            )}
                            {product.title}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[var(--text-primary)]">৳{product.price.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className="text-[var(--text-secondary)] text-xs">{product.sizes.join(', ')}</span>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <div className="flex gap-1.5">
                            {product.stock.map((s) => (
                              <button
                                key={s.size}
                                onClick={() => stockMutation.mutate({ id: product._id, size: s.size, inStock: !s.inStock })}
                                disabled={stockMutation.isPending}
                                aria-label={`${s.size}: ${s.inStock ? 'In stock, click to mark out of stock' : 'Out of stock, click to mark in stock'}`}
                                className={`w-9 h-9 rounded-lg text-xs flex items-center justify-center border transition-colors ${
                                  s.inStock
                                    ? 'border-emerald-700 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/50'
                                    : 'border-red-800 bg-red-900/20 text-red-500 hover:bg-red-800/30'
                                }`}
                              >
                                {s.size}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs ${product.active ? 'text-emerald-400' : 'text-red-400'}`}>
                            {product.active ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            {!product.active && (
                              <button
                                onClick={() => activateMutation.mutate({ id: product._id, active: true })}
                                disabled={activateMutation.isPending}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors disabled:opacity-50"
                                title="Activate"
                                aria-label={`Activate ${product.title}`}
                              >
                                <CheckCircle size={14} aria-hidden="true" />
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                              title="Edit"
                              aria-label={`Edit ${product.title}`}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                              title="Deactivate"
                              aria-label={`Deactivate ${product.title}`}
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
        <Modal onClose={closeModal} labelledBy="product-modal-title">
          <h2
            id="product-modal-title"
            className="text-lg tracking-[0.15em] uppercase"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {editing ? 'Edit Product' : 'Add Product'}
          </h2>

          {editing?.images?.[0] && (
            <div className="w-full h-40 bg-[var(--bg-secondary)] rounded-lg overflow-hidden mt-3">
              <img src={cloudinaryUrl(editing.images[0], 400)} alt={editing.title} className="w-full h-full object-cover" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 mt-4">
            <FormField label="Title" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                />
              )}
            </FormField>

            <FormField label="Description" required>
              {({ id }) => (
                <textarea
                  id={id}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none"
                />
              )}
            </FormField>

            <FormField label="Price (in taka)" required>
              {({ id }) => (
                <>
                  <input
                    id={id}
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="1"
                    className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {form.price ? `৳${parseInt(form.price, 10).toLocaleString()}` : '৳0'}
                  </p>
                </>
              )}
            </FormField>

            <FormField label="Image URLs (comma-separated)" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  required
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                />
              )}
            </FormField>

            <FormField label="Upload product image (optional)">
              {({ id }) => (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={id}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer ${
                      uploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {uploading ? <Spinner size={14} /> : <Upload size={14} aria-hidden="true" />}
                    {uploading ? 'Uploading...' : 'Choose file'}
                  </label>
                  <input
                    id={id}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">Uploads to Cloudinary and appends the URL above.</span>
                </div>
              )}
            </FormField>

            <FormField label="Sizes" required error={form.sizes.length === 0 ? 'Select at least one size.' : null}>
              {() => (
                <div className="flex gap-2" role="group" aria-label="Available sizes">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      aria-pressed={form.sizes.includes(size)}
                      className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                        form.sizes.includes(size)
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </FormField>

            <FormField label="Size Guide Note">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.sizeGuideNote}
                  onChange={(e) => setForm({ ...form, sizeGuideNote: e.target.value })}
                  placeholder="e.g. Runs true to size"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                />
              )}
            </FormField>

            <FormField label="Tags (comma-separated)">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="streetwear, japanese, graphic"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none"
                />
              )}
            </FormField>

            <FormField label="Featured">
              {({ id }) => (
                <div className="flex items-center gap-2">
                  <button
                    id={id}
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    role="switch"
                    aria-checked={form.featured}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.featured ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        form.featured ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {form.featured ? 'Featured on homepage' : 'Not featured'}
                  </span>
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
                disabled={isSubmitting || form.sizes.length === 0}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors inline-flex items-center justify-center gap-2 ${
                  isSubmitting || form.sizes.length === 0
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
          title="Deactivate Product"
          message={`Deactivate "${deleteTarget.title}"? It will no longer be visible to customers.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
          confirmLabel="Deactivate"
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