import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Eye, EyeOff, Pencil, Plus, RefreshCw, Tag } from 'lucide-react';
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
import { formatCurrency, formatDate } from '../../lib/format';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/coupons';

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

const COUPON_SORTERS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  code: (a, b) => a.code.localeCompare(b.code),
  value_desc: (a, b) => b.value - a.value,
  expiry_asc: (a, b) => {
    const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
    const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
    return aTime - bTime;
  },
};

const isExpired = (coupon) => Boolean(coupon.expiresAt && new Date(coupon.expiresAt) < new Date());

const fieldClass =
  'w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const couponValue = (coupon) =>
  coupon.discountType === 'fixed' ? formatCurrency(coupon.value) : `${coupon.value}%`;

export default function Coupons() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const initialFormRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkHandled = useRef(false);

  const { data: coupons, isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: getCoupons,
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
  } = useListControls(coupons, {
    searchText: (coupon) => [coupon.code],
    filterKey: statusFilter,
    filterFn: (coupon) => {
      const expired = isExpired(coupon);
      if (statusFilter === 'active') return coupon.active && !expired;
      if (statusFilter === 'inactive') return !coupon.active && !expired;
      if (statusFilter === 'expired') return expired;
      return true;
    },
    sorters: COUPON_SORTERS,
    initialSort: 'newest',
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
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      finalizeClose();
      toast({ type: 'success', message: 'Coupon created successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to create coupon.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      finalizeClose();
      toast({ type: 'success', message: 'Coupon updated successfully.' });
    },
    onError: (err) => {
      applyServerErrors(err);
      setFormError(err.message);
      toast({ type: 'error', message: err.message || 'Failed to update coupon.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setDeleteTarget(null);
      toast({ type: 'success', message: 'Coupon deactivated.' });
    },
    onError: (err) => {
      setDeleteTarget(null);
      toast({ type: 'error', message: err.message || 'Failed to deactivate coupon.' });
    },
  });

  const activateMutation = useMutation({
    mutationFn: ({ id }) => updateCoupon(id, { active: true }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['adminCoupons'], (old) =>
        Array.isArray(old)
          ? old.map((coupon) => (coupon._id === updated._id ? updated : coupon))
          : old
      );
      toast({ type: 'success', message: 'Coupon activated.' });
    },
    onError: (err) => {
      toast({ type: 'error', message: err.message || 'Failed to activate coupon.' });
    },
  });

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

  useEffect(() => {
    if (deepLinkHandled.current || searchParams.get('new') !== '1') return;
    deepLinkHandled.current = true;
    openAdd();
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, []);

  const openEdit = (coupon) => {
    const initial = {
      code: coupon.code,
      discountType: coupon.discountType,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : '',
      active: coupon.active,
    };
    setEditing(coupon);
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
    if (submitting) return;
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    finalizeClose();
  };

  const intOrZero = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : 0;
  };

  const validate = () => {
    const next = {};
    const code = form.code.trim().toUpperCase();
    if (!code) next.code = 'Coupon code is required.';
    else if (code.length > 30) next.code = 'Coupon code must be 30 characters or fewer.';

    const value = Number(form.value);
    if (!Number.isInteger(value) || value < 1) next.value = 'Value must be a whole number of at least 1.';
    else if (form.discountType === 'percent' && value > 100) next.value = 'Percent value must be 100 or fewer.';

    const numericFields = [
      ['minOrderAmount', 'Minimum order'],
      ['maxDiscount', 'Max discount'],
      ['usageLimit', 'Usage limit'],
      ['perUserLimit', 'Per-user limit'],
    ];
    for (const [field, label] of numericFields) {
      if (form[field] !== '' && (!Number.isInteger(Number(form[field])) || Number(form[field]) < 0)) {
        next[field] = `${label} must be a whole number of 0 or more.`;
      }
    }

    if (form.expiresAt) {
      const expiry = new Date(`${form.expiresAt}T23:59:59`);
      if (Number.isNaN(expiry.getTime())) next.expiresAt = 'Enter a valid expiry date.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const data = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      value: Number(form.value),
      minOrderAmount: intOrZero(form.minOrderAmount),
      maxDiscount: intOrZero(form.maxDiscount),
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
      usageLimit: intOrZero(form.usageLimit),
      perUserLimit: intOrZero(form.perUserLimit),
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
        title="Admin Coupons"
        description="Admin dashboard — coupon management."
        path="/admin/coupons"
        noindex
      />

      <AdminPageHeader
        title="Coupons"
        description="Create discount codes, set limits, and control availability."
      >
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="uppercase tracking-wider">Add coupon</span>
        </button>
      </AdminPageHeader>

      <AdminToolbar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search coupon codes..."
        searchLabel="Search coupons"
        filters={[
          {
            label: 'Filter coupons',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All coupons' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'expired', label: 'Expired' },
            ],
          },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: 'newest', label: 'Newest first' },
          { value: 'code', label: 'Code A–Z' },
          { value: 'value_desc', label: 'Value: high to low' },
          { value: 'expiry_asc', label: 'Expiry: soonest' },
        ]}
        total={total}
        totalLabel="coupon"
      />

      {isLoading && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]" aria-busy="true">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Code', 'Type', 'Value', 'Limits', 'Usage', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} scope="col" className="px-3 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-14" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-3 py-3"><Skeleton className="ml-auto h-8 w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fetchError && <ErrorState message={fetchError.message} onRetry={refetch} />}

      {coupons && filtered.length === 0 && (
        <EmptyState
          icon={Tag}
          message={hasFilters ? 'No coupons match your filters' : 'No coupons yet. Create one to start offering discounts.'}
          action={
            hasFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Clear filters
              </button>
            ) : (
              <button type="button" onClick={openAdd} className="text-sm text-[var(--accent)] transition-colors hover:text-blue-400">
                Add coupon
              </button>
            )
          }
        />
      )}

      {coupons && filtered.length > 0 && (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
            <table className="w-full text-sm" aria-label="Admin coupons">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Code</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Type</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Value</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Limits</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Usage</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Expires</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[var(--text-secondary)] font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((coupon) => {
                  const expired = isExpired(coupon);
                  return (
                    <tr key={coupon._id} className={`border-b border-[var(--border)]/50 last:border-0 ${!coupon.active ? 'bg-red-500/[0.03]' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)]">{coupon.code}</td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                        {coupon.discountType === 'fixed' ? 'Fixed amount' : 'Percentage'}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">{couponValue(coupon)}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs text-[var(--text-secondary)]">
                          {coupon.minOrderAmount > 0 && <p>Min order {formatCurrency(coupon.minOrderAmount)}</p>}
                          {coupon.discountType === 'percent' && coupon.maxDiscount > 0 && (
                            <p>Max discount {formatCurrency(coupon.maxDiscount)}</p>
                          )}
                          {coupon.perUserLimit > 0 && <p>{coupon.perUserLimit} per user</p>}
                          {coupon.minOrderAmount === 0 && coupon.maxDiscount === 0 && coupon.perUserLimit === 0 && (
                            <p>None</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-[var(--text-secondary)]">
                        {coupon.timesUsed}
                        {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit.toLocaleString()}` : ''}
                      </td>
                      <td className={`px-4 py-3 text-xs ${expired ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                        {formatDate(coupon.expiresAt, 'Never')}
                      </td>
                      <td className="px-4 py-3">
                        {expired ? (
                          <StatusBadge tone="red">Expired</StatusBadge>
                        ) : (
                          <StatusBadge tone={coupon.active ? 'emerald' : 'neutral'}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!coupon.active && !expired && (
                            <IconButton
                              label={`Activate ${coupon.code}`}
                              tone="emerald"
                              disabled={activePending(coupon._id)}
                              onClick={() => activateMutation.mutate({ id: coupon._id })}
                            >
                              {activePending(coupon._id) ? <Spinner size={14} /> : <RefreshCw size={15} aria-hidden="true" />}
                            </IconButton>
                          )}
                          <IconButton
                            label={`Edit ${coupon.code}`}
                            tone="accent"
                            onClick={() => openEdit(coupon)}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </IconButton>
                          {coupon.active && (
                            <IconButton
                              label={`Deactivate ${coupon.code}`}
                              tone="danger"
                              onClick={() => setDeleteTarget(coupon)}
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
            {pageItems.map((coupon) => {
              const expired = isExpired(coupon);
              return (
                <div key={coupon._id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm text-[var(--text-primary)]">{coupon.code}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {coupon.discountType === 'fixed' ? 'Fixed amount' : 'Percentage'} · {couponValue(coupon)}
                      </p>
                    </div>
                    {expired ? (
                      <StatusBadge tone="red">Expired</StatusBadge>
                    ) : (
                      <StatusBadge tone={coupon.active ? 'emerald' : 'neutral'}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>{coupon.timesUsed}{coupon.usageLimit > 0 ? ` / ${coupon.usageLimit.toLocaleString()}` : ''} used</span>
                    <span>{formatDate(coupon.expiresAt, 'Never expires')}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    {!coupon.active && !expired && (
                      <button
                        type="button"
                        onClick={() => activateMutation.mutate({ id: coupon._id })}
                        disabled={activePending(coupon._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                      >
                        <Eye size={14} aria-hidden="true" />
                        Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(coupon)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit
                    </button>
                    {coupon.active && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(coupon)}
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
        title={editing ? 'Edit coupon' : 'Add coupon'}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-3">
            <button type="button" onClick={requestClose} className={`flex-1 ${secondaryButton}`}>
              Cancel
            </button>
            <button
              type="submit"
              form="coupon-form"
              disabled={submitting}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                submitting
                  ? 'cursor-not-allowed bg-[var(--border)] text-[var(--text-secondary)]'
                  : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
              }`}
            >
              {submitting && <Spinner size={14} />}
              {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create coupon'}
            </button>
          </div>
        }
      >
        <form id="coupon-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Coupon code" required error={errors.code}>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  maxLength={30}
                  placeholder="WELCOME10"
                  className={`${fieldClass} font-mono`}
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
                      className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label={form.discountType === 'fixed' ? 'Value (taka)' : 'Value (%)'} required error={errors.value}>
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  min="1"
                  max={form.discountType === 'percent' ? 100 : undefined}
                  className={fieldClass}
                />
              )}
            </FormField>

            <FormField label="Minimum order" error={errors.minOrderAmount} helperText="0 means no minimum.">
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

            <FormField label="Max discount for %" error={errors.maxDiscount} helperText="0 means no cap.">
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

            <FormField label="Expires on" error={errors.expiresAt} helperText="Ends at 11:59 PM local time.">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Total usage limit" error={errors.usageLimit} helperText="0 means unlimited.">
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

            <FormField label="Per-user limit" error={errors.perUserLimit} helperText="0 means unlimited.">
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

          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              role="switch"
              aria-checked={form.active}
              aria-label="Coupon active"
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
              <p className="text-xs text-[var(--text-secondary)]">Inactive coupons are rejected at checkout.</p>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate coupon"
        message={`Deactivate "${deleteTarget?.code}"? It will no longer be accepted at checkout.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        confirmLabel="Deactivate"
        danger
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard changes?"
        message="Your unsaved coupon changes will be lost."
        onConfirm={finalizeClose}
        confirmLabel="Discard"
        danger
      />
    </>
  );
}
