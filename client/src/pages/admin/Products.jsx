import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  Image as ImageIcon,
  Pencil,
  Plus,
  Star,
  Upload,
  X,
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
import { useToast } from '../../components/ui/Toast';
import Pagination from '../../components/ui/Pagination';
import useListControls from '../../hooks/useListControls';
import { formatCurrency } from '../../lib/format';
import { cloudinaryUrl, IMAGE_FALLBACK } from '../../lib/image';
import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock,
  setProductActive,
  setProductFeatured,
  setProductHomeCollection,
} from '../../api/products';
import { uploadImage } from '../../api/upload';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRODUCT_SORTERS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  title: (a, b) => a.title.localeCompare(b.title),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

const productSearchText = (product) => [
  product.title,
  product.description,
  ...(product.tags || []),
];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  images: [],
  sizes: [],
  stock: {},
  sizeGuideNote: '',
  tags: [],
  featured: false,
  homeCollection: false,
  collectionOrder: '',
};

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function Products() {
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
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const initialFormRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkHandled = useRef(false);

  const { data: products, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAllProductsAdmin,
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
  } = useListControls(products, {
    searchText: productSearchText,
    filterKey: statusFilter,
    filterFn: (product) => {
      if (statusFilter === 'active') return product.active;
      if (statusFilter === 'inactive') return !product.active;
      if (statusFilter === 'featured') return product.featured;
      if (statusFilter === 'home') return product.homeCollection;
      return true;
    },
    sorters: PRODUCT_SORTERS,
    initialSort: 'newest',
    pageSize: 10,
  });

  const [submitting, setSubmitting] = useState(false);
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
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      finalizeClose();
      toast({ type: 'success', message: 'Product created successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to create product.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      finalizeClose();
      toast({ type: 'success', message: 'Product updated successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to update product.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteTarget(null);
      toast({ type: 'success', message: 'Product deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      toast({ type: 'error', message: err.message || 'Failed to deactivate product.' });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, size, inStock }) => toggleStock(id, size, inStock),
    onMutate: ({ id, size, inStock }) => {
      const previous = queryClient.getQueryData(['adminProducts']);
      queryClient.setQueryData(['adminProducts'], (old) =>
        Array.isArray(old)
          ? old.map((product) =>
              product._id === id
                ? {
                    ...product,
                    stock: product.stock.map((item) =>
                      item.size === size ? { ...item, inStock } : item
                    ),
                  }
                : product
            )
          : old
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['adminProducts'], context.previous);
      }
      toast({ type: 'error', message: err.message || 'Failed to update stock.' });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminProducts'], (old) =>
        Array.isArray(old)
          ? old.map((product) => (product._id === updated._id ? updated : product))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id, active }) => setProductActive(id, active),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminProducts'], (old) =>
        Array.isArray(old)
          ? old.map((product) => (product._id === updated._id ? updated : product))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ type: 'success', message: updated.active ? 'Product activated.' : 'Product deactivated.' });
    },
    onError: (err) => {
      toast({ type: 'error', message: err.message || 'Failed to update product.' });
    },
  });

  const featuredMutation = useMutation({
    mutationFn: ({ id, featured }) => setProductFeatured(id, featured),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminProducts'], (old) =>
        Array.isArray(old)
          ? old.map((product) => (product._id === updated._id ? updated : product))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      toast({ type: 'error', message: err.message || 'Failed to update featured.' });
    },
  });

  const homeCollectionMutation = useMutation({
    mutationFn: ({ id, ...payload }) => setProductHomeCollection(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminProducts'], (old) =>
        Array.isArray(old)
          ? old.map((product) => (product._id === updated._id ? updated : product))
          : old
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      toast({ type: 'error', message: err.message || 'Failed to update homepage collection.' });
    },
  });

  const pending = (mutation, id) => mutation.isPending && mutation.variables?.id === id;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file, 'integration/products');
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      setErrors((prev) => ({ ...prev, images: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, images: err.message }));
      toast({ type: 'error', message: err.message || 'Image upload failed.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addImageUrl = () => {
    const value = imageUrl.trim();
    if (!value) return;
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      setErrors((prev) => ({ ...prev, images: 'Image URL must start with http:// or https://.' }));
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, value] }));
    setImageUrl('');
    setErrors((prev) => ({ ...prev, images: null }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    const value = tagInput.trim().replace(/,$/, '');
    if (!value) return;
    if (!form.tags.includes(value)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, value] }));
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const toggleSize = (size) => {
    setForm((prev) => {
      const selected = prev.sizes.includes(size);
      const sizes = selected ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      const stock = { ...prev.stock };
      if (selected) {
        delete stock[size];
      } else if (stock[size] === undefined) {
        stock[size] = true;
      }
      return { ...prev, sizes, stock };
    });
    setErrors((prev) => ({ ...prev, sizes: null }));
  };

  const openAdd = () => {
    const initial = { ...emptyForm, images: [], sizes: [], stock: {}, tags: [] };
    setEditing(null);
    setForm(initial);
    initialFormRef.current = JSON.stringify(initial);
    setErrors({});
    setFormError(null);
    setImageUrl('');
    setTagInput('');
    setDiscardOpen(false);
    setShowModal(true);
  };

  useEffect(() => {
    if (deepLinkHandled.current || searchParams.get('new') !== '1') return;
    deepLinkHandled.current = true;
    openAdd();
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, []);

  const openEdit = (product) => {
    const stock = {};
    (product.stock || []).forEach((item) => {
      stock[item.size] = item.inStock;
    });
    const initial = {
      title: product.title,
      description: product.description,
      price: String(product.price),
      images: [...product.images],
      sizes: [...product.sizes],
      stock,
      sizeGuideNote: product.sizeGuideNote || '',
      tags: [...(product.tags || [])],
      featured: product.featured === true,
      homeCollection: product.homeCollection === true,
      collectionOrder: String(product.collectionOrder ?? 0),
    };
    setEditing(product);
    setForm(initial);
    initialFormRef.current = JSON.stringify(initial);
    setErrors({});
    setFormError(null);
    setImageUrl('');
    setTagInput('');
    setDiscardOpen(false);
    setShowModal(true);
  };

  const finalizeClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setFormError(null);
    setImageUrl('');
    setTagInput('');
    initialFormRef.current = null;
    setDiscardOpen(false);
  };

  const requestClose = () => {
    if (uploading || submitting) return;
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    finalizeClose();
  };

  const validate = () => {
    const next = {};
    const title = form.title.trim();
    if (!title) next.title = 'Title is required.';
    else if (title.length > 100) next.title = 'Title must be 100 characters or fewer.';

    const description = form.description.trim();
    if (!description) next.description = 'Description is required.';
    else if (description.length < 10) next.description = 'Description must be at least 10 characters.';

    const price = Number(form.price);
    if (!Number.isInteger(price) || price < 1) next.price = 'Price must be a whole number of at least ৳1.';

    if (form.images.length === 0) next.images = 'Add at least one image.';
    if (form.sizes.length === 0) next.sizes = 'Select at least one size.';

    const collectionOrder = form.collectionOrder === '' ? 0 : Number(form.collectionOrder);
    if (!Number.isInteger(collectionOrder) || collectionOrder < 0) {
      next.collectionOrder = 'Collection order must be a whole number of 0 or more.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      images: form.images,
      sizes: form.sizes,
      stock: form.sizes.map((size) => ({ size, inStock: form.stock[size] !== false })),
      sizeGuideNote: form.sizeGuideNote.trim(),
      tags: form.tags,
      featured: form.featured === true,
      homeCollection: form.homeCollection === true,
      collectionOrder: form.collectionOrder === '' ? 0 : Number(form.collectionOrder),
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

  return (
    <>
      <MetaTags
        title="Admin Products"
        description="Admin dashboard — product management."
        path="/admin/products"
        noindex
      />

      <AdminPageHeader
        title="Products"
        description="Manage catalog details, pricing, imagery, and per-size stock."
      >
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="uppercase tracking-wider">Add product</span>
        </button>
      </AdminPageHeader>

      <AdminToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search products, descriptions, or tags..."
        searchLabel="Search products"
        filters={[
          {
            label: 'Filter products',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All products' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'featured', label: 'Featured' },
              { value: 'home', label: 'Homepage collection' },
            ],
          },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'newest', label: 'Newest first' },
          { value: 'title', label: 'Title A–Z' },
          { value: 'price_asc', label: 'Price: low to high' },
          { value: 'price_desc', label: 'Price: high to low' },
        ]}
        total={total}
        totalLabel="product"
      />

      {isLoading && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]" aria-busy="true">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['', 'Title', 'Price', 'Sizes', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="px-3 py-3"><Skeleton className="h-10 w-10 rounded-lg" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-8 w-28" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3"><Skeleton className="ml-auto h-8 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fetchError && <ErrorState message={fetchError.message} onRetry={refetch} />}

      {products && filtered.length === 0 && (
        <EmptyState
          icon={products.length === 0 ? ImageIcon : undefined}
          message={hasFilters ? 'No products match your filters' : 'No products yet. Add your first product to get started.'}
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={openAdd} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Add product
              </button>
            )
          }
        />
      )}

      {products && filtered.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
            <table className="w-full text-sm" aria-label="Admin products">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="w-14 px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal"></th>
                  <th scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Product</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Price</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Sizes</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Stock</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Status</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((product) => {
                  const stockPending = pending(stockMutation, product._id);
                  const featuredPending = pending(featuredMutation, product._id);
                  const homePending = pending(homeCollectionMutation, product._id);
                  const activePending = pending(activateMutation, product._id);
                  return (
                    <tr key={product._id} className={`border-b border-[var(--border)]/50 last:border-0 ${!product.active ? 'bg-red-500/[0.03]' : ''}`}>
                      <td className="px-3 py-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
                          <img
                            src={cloudinaryUrl(product.images[0], 120)}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = IMAGE_FALLBACK;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <p className="max-w-[220px] truncate text-[var(--text-primary)]">{product.title}</p>
                          <IconButton
                            label={product.featured ? `Remove ${product.title} from featured` : `Feature ${product.title}`}
                            tone="amber"
                            disabled={featuredPending}
                            onClick={() => featuredMutation.mutate({ id: product._id, featured: !product.featured })}
                            className="h-8 w-8"
                          >
                            <Star size={14} className={product.featured ? 'fill-amber-400' : ''} aria-hidden="true" />
                          </IconButton>
                          <IconButton
                            label={product.homeCollection ? `Remove ${product.title} from homepage collection` : `Add ${product.title} to homepage collection`}
                            tone="emerald"
                            disabled={homePending}
                            onClick={() =>
                              homeCollectionMutation.mutate({ id: product._id, homeCollection: !product.homeCollection })
                            }
                            className="h-8 w-8"
                          >
                            <Home size={14} aria-hidden="true" />
                          </IconButton>
                          {featuredPending || homePending ? <Spinner size={12} /> : null}
                        </div>
                        {product.tags?.length > 0 && (
                          <p className="mt-1 max-w-[260px] truncate text-xs text-[var(--text-secondary)]">
                            {product.tags.join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-[var(--text-primary)]">{formatCurrency(product.price)}</td>
                      <td className="px-3 py-3 text-xs text-[var(--text-secondary)]">{product.sizes.join(', ')}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {product.stock.map((item) => (
                            <button
                              key={item.size}
                              type="button"
                              onClick={() => stockMutation.mutate({ id: product._id, size: item.size, inStock: !item.inStock })}
                              disabled={stockPending}
                              aria-pressed={item.inStock}
                              aria-label={`${item.size}: ${item.inStock ? 'in stock' : 'out of stock'}`}
                              className={`h-9 min-w-9 rounded-lg border px-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                item.inStock
                                  ? 'border-emerald-700 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/50'
                                  : 'border-red-800 bg-red-900/20 text-red-500 line-through hover:bg-red-800/30'
                              }`}
                            >
                              {item.size}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge tone={product.active ? 'emerald' : 'red'}>
                          {product.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!product.active && (
                            <IconButton
                              label={`Activate ${product.title}`}
                              tone="emerald"
                              disabled={activePending}
                              onClick={() => activateMutation.mutate({ id: product._id, active: true })}
                            >
                              <Eye size={16} aria-hidden="true" />
                            </IconButton>
                          )}
                          <IconButton
                            label={`Edit ${product.title}`}
                            tone="accent"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </IconButton>
                          {product.active && (
                            <IconButton
                              label={`Deactivate ${product.title}`}
                              tone="danger"
                              onClick={() => setDeleteTarget(product)}
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
            {pageItems.map((product) => {
              const stockPending = pending(stockMutation, product._id);
              const activePending = pending(activateMutation, product._id);
              return (
                <div key={product._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-primary)]">
                      <img
                        src={cloudinaryUrl(product.images[0], 160)}
                        alt=""
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
                        <p className="truncate text-sm text-[var(--text-primary)]">{product.title}</p>
                        <StatusBadge tone={product.active ? 'emerald' : 'red'}>
                          {product.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">{formatCurrency(product.price)}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">Sizes: {product.sizes.join(', ')}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="mb-1.5 text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Stock</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.stock.map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => stockMutation.mutate({ id: product._id, size: item.size, inStock: !item.inStock })}
                          disabled={stockPending}
                          aria-pressed={item.inStock}
                          aria-label={`${item.size}: ${item.inStock ? 'in stock' : 'out of stock'}`}
                          className={`h-9 min-w-9 rounded-lg border px-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            item.inStock
                              ? 'border-emerald-700 bg-emerald-900/30 text-emerald-400'
                              : 'border-red-800 bg-red-900/20 text-red-500 line-through'
                          }`}
                        >
                          {item.size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    {!product.active && (
                      <button
                        type="button"
                        onClick={() => activateMutation.mutate({ id: product._id, active: true })}
                        disabled={activePending}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                      >
                        <Eye size={14} aria-hidden="true" />
                        Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit
                    </button>
                    {product.active && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
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
        title={editing ? 'Edit product' : 'Add product'}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={requestClose} className={`flex-1 ${secondaryButton}`}>
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={submitting || uploading}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                submitting || uploading
                  ? 'cursor-not-allowed bg-[var(--border)] text-[var(--text-secondary)]'
                  : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
              }`}
            >
              {submitting && <Spinner size={14} />}
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create product'}
            </button>
          </div>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          )}

          <FormField label="Title" required error={errors.title}>
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={100}
                className={fieldClass}
              />
            )}
          </FormField>

          <FormField label="Description" required error={errors.description} helperText="At least 10 characters.">
            {({ id }) => (
              <textarea
                id={id}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className={`${fieldClass} resize-y`}
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Price (taka)" required error={errors.price}>
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={fieldClass}
                />
              )}
            </FormField>

            <FormField label="Collection order" error={errors.collectionOrder} helperText="0 appears first.">
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min="0"
                  value={form.collectionOrder}
                  onChange={(e) => setForm({ ...form, collectionOrder: e.target.value })}
                  placeholder="0"
                  className={fieldClass}
                />
              )}
            </FormField>
          </div>

          <FormField label="Images" required error={errors.images}>
            {({ id }) => (
              <div className="space-y-2">
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {form.images.map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]"
                      >
                        <img
                          src={cloudinaryUrl(src, 240)}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = IMAGE_FALLBACK;
                          }}
                        />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-white transition-colors hover:bg-red-600"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={13} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    id={id}
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={fieldClass}
                  />
                  <button type="button" onClick={addImageUrl} className={secondaryButton}>
                    Add
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`${id}-upload`}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] ${
                      uploading ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    {uploading ? <Spinner size={14} /> : <Upload size={14} aria-hidden="true" />}
                    {uploading ? 'Uploading...' : 'Upload image'}
                  </label>
                  <input
                    id={`${id}-upload`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">
                    The first image is used as the main product image.
                  </span>
                </div>
              </div>
            )}
          </FormField>

          <FormField label="Sizes and stock" required error={errors.sizes}>
            {() => (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Available sizes">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      aria-pressed={form.sizes.includes(size)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        form.sizes.includes(size)
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {form.sizes.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {form.sizes.map((size) => {
                      const inStock = form.stock[size] !== false;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, stock: { ...prev.stock, [size]: !inStock } }))}
                          aria-pressed={inStock}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                            inStock
                              ? 'border-emerald-700 bg-emerald-900/20 text-emerald-400'
                              : 'border-red-800 bg-red-900/20 text-red-400'
                          }`}
                        >
                          <span className="font-medium">{size}</span>
                          <span>{inStock ? 'In stock' : 'Out of stock'}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </FormField>

          <FormField label="Tags" helperText="Press Enter or comma to add a tag.">
            {({ id }) => (
              <div className="space-y-2">
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] py-1 pl-2.5 pr-1 text-xs text-[var(--text-secondary)]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={11} aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    id={id}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="streetwear, japanese, graphic"
                    className={fieldClass}
                  />
                  <button type="button" onClick={addTag} className={secondaryButton}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </FormField>

          <FormField label="Size guide note">
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={form.sizeGuideNote}
                onChange={(e) => setForm({ ...form, sizeGuideNote: e.target.value })}
                placeholder="e.g. Runs true to size"
                className={fieldClass}
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, featured: !form.featured })}
                role="switch"
                aria-checked={form.featured}
                aria-label="Featured on homepage"
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.featured ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    form.featured ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-[var(--text-primary)]">Featured</p>
                <p className="text-xs text-[var(--text-secondary)]">Highlight on the homepage.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, homeCollection: !form.homeCollection })}
                role="switch"
                aria-checked={form.homeCollection}
                aria-label="Show in homepage collection"
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.homeCollection ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    form.homeCollection ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-[var(--text-primary)]">Homepage collection</p>
                <p className="text-xs text-[var(--text-secondary)]">Show in the curated collection.</p>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate product"
        message={`Deactivate "${deleteTarget?.title}"? It will be hidden from customers but kept in the catalog.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        confirmLabel="Deactivate"
        danger
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard changes?"
        message="Your unsaved product changes will be lost."
        onConfirm={finalizeClose}
        confirmLabel="Discard"
        danger
      />
    </>
  );
}
