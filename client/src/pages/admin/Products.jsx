import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct, toggleStock } from '../../api/products';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  images: '',
  sizes: [],
  sizeGuideNote: '',
  tags: '',
};

export default function Products() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  const { data: products, isLoading, error: fetchError } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAllProductsAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      closeModal();
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, size, inStock }) => toggleStock(id, size, inStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
  });

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
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: parseInt(form.price, 10),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes,
      sizeGuideNote: form.sizeGuideNote.trim(),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editing) {
      updateMutation.mutate({ id: editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (product) => {
    if (window.confirm(`Deactivate "${product.title}"? It will no longer be visible to customers.`)) {
      deleteMutation.mutate(product._id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Helmet>
        <title>Admin Products — Integration</title>
      </Helmet>

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1
                className="text-3xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Admin — Products
              </h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-sm transition-colors"
              >
                <Plus size={16} />
                <span className="tracking-wider uppercase">Add Product</span>
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-20">
                <div className="animate-pulse text-gray-500">Loading products...</div>
              </div>
            )}

            {fetchError && (
              <div className="text-center py-20">
                <p className="text-red-400">Failed to load products</p>
                <p className="text-sm text-gray-500 mt-2">{fetchError.message}</p>
              </div>
            )}

            {products && products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400">No products yet</p>
              </div>
            )}

            {products && products.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal w-12"></th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Title</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Price</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal hidden sm:table-cell">Sizes</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal hidden md:table-cell">Stock</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Active</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-gray-500 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className={`border-b border-gray-800/50 ${!product.active ? 'opacity-40' : 'hover:bg-gray-900/30'}`}
                      >
                        <td className="py-3 px-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-sm overflow-hidden">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-gray-300 truncate max-w-[150px] sm:max-w-[200px]">{product.title}</p>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-gray-300">৳{(product.price / 100).toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className="text-gray-400 text-xs">{product.sizes.join(', ')}</span>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <div className="flex gap-1.5">
                            {product.stock.map((s) => (
                              <button
                                key={s.size}
                                onClick={() => stockMutation.mutate({ id: product._id, size: s.size, inStock: !s.inStock })}
                                disabled={stockMutation.isPending}
                                className={`w-9 h-9 rounded-lg text-xs flex items-center justify-center border transition-colors ${
                                  s.inStock
                                    ? 'border-green-700 bg-green-900/30 text-green-400 hover:bg-green-800/50'
                                    : 'border-red-800 bg-red-900/20 text-red-500 hover:bg-red-800/30'
                                }`}
                                title={`${s.size}: ${s.inStock ? 'In stock (click to toggle)' : 'Out of stock (click to toggle)'}`}
                              >
                                {s.size}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs ${product.active ? 'text-green-400' : 'text-red-400'}`}>
                            {product.active ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#111] border border-gray-800 rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2
                className="text-lg tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Price (in cents) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="1"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {form.price ? `৳${(parseInt(form.price, 10) / 100).toLocaleString()}` : '৳0'}
                </p>
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Image URLs * (comma-separated)</label>
                <input
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  required
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">Sizes *</label>
                <div className="flex gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 text-sm border rounded-sm transition-colors ${
                        form.sizes.includes(size)
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Size Guide Note</label>
                <input
                  type="text"
                  value={form.sizeGuideNote}
                  onChange={(e) => setForm({ ...form, sizeGuideNote: e.target.value })}
                  placeholder="e.g. Runs true to size"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="streetwear, japanese, graphic"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-sm text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-sm text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-gray-700 text-gray-400 text-sm rounded-sm hover:border-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || form.sizes.length === 0}
                  className={`flex-1 py-2 text-sm rounded-sm transition-colors ${
                    isSubmitting || form.sizes.length === 0
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
