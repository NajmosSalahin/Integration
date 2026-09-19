import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MetaTags from '../../components/MetaTags';
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle, Tag, RefreshCw } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/coupons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FormField from '../../components/ui/FormField';
import Spinner from '../../components/ui/Spinner';

const emptyForm = {
  code: '',
  discountType: 'fixed',
  value: '',
  minOrderAmount: '',
  maxDiscount: '',
  expiresAt: '',
  usageLimit: '',
  perUserLimit: '',
  active: true,
};

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none';

export default function Coupons() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: coupons, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: getCoupons,
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      closeModal();
      setToast({ type: 'success', message: 'Coupon created successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      closeModal();
      setToast({ type: 'success', message: 'Coupon updated successfully.' });
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Coupon deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      setToast({ type: 'error', message: err.message || 'Failed to deactivate coupon.' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id }) => updateCoupon(id, { active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setToast({ type: 'success', message: 'Coupon activated.' });
    },
    onError: (err) => {
      setToast({ type: 'error', message: err.message || 'Failed to activate coupon.' });
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : '',
      active: coupon.active,
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

  const intOrZero = (v) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const code = form.code.trim().toUpperCase();
    if (!code) {
      setError('Coupon code is required.');
      return;
    }

    const value = parseInt(form.value, 10);
    if (!value || value < 1) {
      setError('Value must be at least 1.');
      return;
    }
    if (form.discountType === 'percent' && value > 100) {
      setError('Percent value must be 100 or fewer.');
      return;
    }

    const data = {
      code,
      discountType: form.discountType,
      value,
      minOrderAmount: intOrZero(form.minOrderAmount),
      maxDiscount: intOrZero(form.maxDiscount),
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      usageLimit: intOrZero(form.usageLimit),
      perUserLimit: intOrZero(form.perUserLimit),
      active: form.active,
    };

    if (editing) {
      updateMutation.mutate({ id: editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const atcTypeBadge = (c) =>
    c.discountType === 'fixed'
      ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
      : 'bg-blue-500/10 text-blue-400';

  const atcValue = (c) => (c.discountType === 'fixed' ? `৳${c.value.toLocaleString()}` : `${c.value}%`);

  return (
    <>
      <MetaTags title="Admin Coupons" description="Admin dashboard — coupon management." path="/admin/coupons" noindex />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />

        <main className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h1
                className="text-2xl sm:text-4xl tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Admin — Coupons
              </h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm rounded-lg transition-colors"
              >
                <Plus size={16} aria-hidden="true" />
                <span className="tracking-wider uppercase">Add Coupon</span>
              </button>
            </div>

            {isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Code', 'Type', 'Value', 'Limits', 'Usage', 'Expires', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50">
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-14 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-28 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-20 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-20 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-8 h-4" /></td>
                        <td className="py-3 px-3"><Skeleton className="w-16 h-4 ml-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {fetchError && <ErrorState message={fetchError.message} onRetry={refetch} />}

            {coupons && coupons.length === 0 && (
              <EmptyState
                icon={Tag}
                message="No coupons yet. Create one to start offering discounts."
                action={
                  <button onClick={openAdd} className="text-sm text-[var(--accent)] hover:text-blue-400 transition-colors">
                    Add Coupon
                  </button>
                }
              />
            )}

            {coupons && coupons.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Admin coupons">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Code</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Type</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Value</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden md:table-cell">Limits</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Usage</th>
                      <th className="text-left py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal hidden sm:table-cell">Expires</th>
                      <th className="text-center py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Status</th>
                      <th className="text-right py-3 px-3 text-xs tracking-wider uppercase text-[var(--text-secondary)] font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr
                        key={coupon._id}
                        className={`border-b border-[var(--border)]/50 ${!coupon.active ? 'opacity-50' : 'hover:bg-[var(--bg-secondary)]'}`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-mono text-[var(--text-primary)]">{coupon.code}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${atcTypeBadge(coupon)}`}>
                            {coupon.discountType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[var(--text-primary)]">{atcValue(coupon)}</span>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                            {coupon.minOrderAmount > 0 && <p>Min order ৳{coupon.minOrderAmount.toLocaleString()}</p>}
                            {coupon.discountType === 'percent' && coupon.maxDiscount > 0 && (
                              <p>Max discount ৳{coupon.maxDiscount.toLocaleString()}</p>
                            )}
                            {coupon.perUserLimit > 0 && <p>{coupon.perUserLimit} per user</p>}
                            {coupon.minOrderAmount === 0 && coupon.maxDiscount === 0 && coupon.perUserLimit === 0 && (
                              <p>None</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-xs text-[var(--text-secondary)]">
                            {coupon.timesUsed}
                            {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit.toLocaleString()}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className={`text-xs ${coupon.expiresAt && new Date(coupon.expiresAt) < new Date() ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Never'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs ${coupon.active ? 'text-emerald-400' : 'text-red-400'}`}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            {!coupon.active && (
                              <button
                                onClick={() => activateMutation.mutate({ id: coupon._id })}
                                className="p-1.5 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors"
                                title="Re-activate"
                                aria-label={`Re-activate ${coupon.code}`}
                              >
                                <RefreshCw size={14} aria-hidden="true" />
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(coupon)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                              title="Edit"
                              aria-label={`Edit ${coupon.code}`}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(coupon)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                              title="Deactivate"
                              aria-label={`Deactivate ${coupon.code}`}
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
        <Modal open={showModal} onClose={closeModal} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
          <form onSubmit={handleSubmit} className="space-y-3 mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Coupon code" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    maxLength={30}
                    placeholder="WELCOME10"
                    className={`${fieldClass} uppercase`}
                  />
                )}
              </FormField>

              <FormField label="Discount type" required>
                {() => (
                  <div className="flex" role="radiogroup" aria-label="Discount type">
                    {['fixed', 'percent'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, discountType: type })}
                        role="radio"
                        aria-checked={form.discountType === type}
                        className={`flex-1 py-2 text-sm border rounded-lg transition-colors ${
                          form.discountType === type
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                        }`}
                      >
                        {type === 'fixed' ? '৳ Fixed' : '% Percent'}
                      </button>
                    ))}
                  </div>
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label={form.discountType === 'fixed' ? 'Value (taka)' : 'Value (%)'} required>
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                    min={form.discountType === 'percent' ? 1 : undefined}
                    max={form.discountType === 'percent' ? 100 : undefined}
                    className={fieldClass}
                  />
                )}
              </FormField>

              <FormField label="Minimum order (0 = none)">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    min="0"
                    placeholder="0"
                    className={fieldClass}
                  />
                )}
              </FormField>

              <FormField label="Max discount for % (0 = no cap)">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    min="0"
                    placeholder="0"
                    className={fieldClass}
                  />
                )}
              </FormField>

              <FormField label="Expires on (optional)">
                {({ id }) => (
                  <input
                    id={id}
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className={fieldClass}
                  />
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Total usage limit (0 = unlimited)">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    min="0"
                    placeholder="0"
                    className={fieldClass}
                  />
                )}
              </FormField>

              <FormField label="Per-user limit (0 = unlimited)">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.perUserLimit}
                    onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                    min="0"
                    placeholder="0"
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
          title="Deactivate Coupon"
          message={`Deactivate "${deleteTarget.code}"? It will no longer be accepted at checkout.`}
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