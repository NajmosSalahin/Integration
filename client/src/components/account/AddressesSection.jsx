import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../api/account';
import { useToast } from '../ui/Toast';

const inputClass =
  'w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]';
const labelClass = 'block text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1.5';

const blankForm = (userName = '') => ({
  label: 'Home',
  name: userName,
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postal: '',
  country: 'Bangladesh',
  isDefault: false,
});

export default function AddressesSection() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [form, setForm] = useState(blankForm(user?.name));

  const addresses = user?.addresses || [];

  const done = (message) => {
    toast({ type: 'success', message });
    setEditing(null);
    setForm(blankForm(user?.name));
    refreshUser();
  };

  const fail = (err, fallback) => toast({ type: 'error', message: err?.message || fallback });

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => done('Address added'),
    onError: (err) => fail(err, 'Failed to add address'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAddress(id, data),
    onSuccess: () => done('Address updated'),
    onError: (err) => fail(err, 'Failed to update address'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast({ type: 'success', message: 'Address deleted' });
      setConfirmId(null);
      refreshUser();
    },
    onError: (err) => fail(err, 'Failed to delete address'),
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      toast({ type: 'success', message: 'Default address updated' });
      refreshUser();
    },
    onError: (err) => fail(err, 'Failed to set default address'),
  });

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openNew = () => {
    setConfirmId(null);
    setEditing('new');
    setForm(blankForm(user?.name));
  };

  const openEdit = (address) => {
    setConfirmId(null);
    setEditing(address._id);
    setForm({ ...blankForm(user?.name), ...address });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing === 'new') {
      createMutation.mutate(form);
    } else if (editing) {
      updateMutation.mutate({ id: editing, data: form });
    }
  };

  const handleDelete = (id) => {
    if (confirmId === id) {
      deleteMutation.mutate(id);
    } else {
      setConfirmId(id);
    }
  };

  const formatAddress = (a) =>
    [a.line1, a.line2, [a.city, a.region].filter(Boolean).join(', '), a.postal, a.country]
      .filter(Boolean)
      .join(', ');

  return (
    <section aria-label="Saved addresses">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-2xl sm:text-3xl tracking-[0.15em] uppercase"
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          Addresses
        </h2>
        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-[var(--accent)] text-[#0e1320] text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-[var(--accent-hover)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          style={{ fontFamily: 'var(--font-utility)' }}
        >
          <Plus size={14} aria-hidden="true" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 && !editing && (
        <p className="text-sm text-[var(--text-secondary)] border border-dashed border-[var(--border)] rounded-[10px] p-6 text-center">
          No saved addresses yet.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {addresses.map((address) => (
          <div
            key={address._id}
            className="relative border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                <MapPin size={14} className="text-[var(--accent)]" aria-hidden="true" />
                {address.label}
                {address.isDefault && (
                  <span className="text-[10px] tracking-[0.15em] uppercase px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                    Default
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(address)}
                  aria-label={`Edit ${address.label} address`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address._id)}
                  aria-label={confirmId === address._id ? `Confirm delete of ${address.label} address` : `Delete ${address.label} address`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  {confirmId === address._id ? (
                    <span className="text-xs tracking-wider uppercase">Sure?</span>
                  ) : (
                    <Trash2 size={14} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm text-[var(--text-primary)]">{address.name}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{formatAddress(address)}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{address.phone}</p>

            {!address.isDefault && (
              <button
                type="button"
                onClick={() => defaultMutation.mutate(address._id)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-hover)] hover:text-[var(--accent)] transition-colors"
              >
                <Star size={12} aria-hidden="true" />
                Make default
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] p-5 sm:p-6 max-w-xl"
        >
          <h3 className="text-lg tracking-[0.15em] uppercase mb-4" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
            {editing === 'new' ? 'Add address' : 'Edit address'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="addr-label" className={labelClass}>Label</label>
              <input id="addr-label" type="text" value={form.label} onChange={setField('label')} placeholder="Home / Office" className={inputClass} />
            </div>
            <div>
              <label htmlFor="addr-name" className={labelClass}>Full name</label>
              <input id="addr-name" type="text" value={form.name} onChange={setField('name')} placeholder="Recipient name" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="addr-phone" className={labelClass}>Phone</label>
              <input id="addr-phone" type="tel" value={form.phone} onChange={setField('phone')} placeholder="01XXXXXXXXX" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="addr-line1" className={labelClass}>Address line 1</label>
              <input id="addr-line1" type="text" value={form.line1} onChange={setField('line1')} placeholder="House, road, area" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="addr-line2" className={labelClass}>Address line 2 (optional)</label>
              <input id="addr-line2" type="text" value={form.line2} onChange={setField('line2')} placeholder="Apartment, floor" className={inputClass} />
            </div>
            <div>
              <label htmlFor="addr-city" className={labelClass}>City</label>
              <input id="addr-city" type="text" value={form.city} onChange={setField('city')} placeholder="Dhaka" className={inputClass} />
            </div>
            <div>
              <label htmlFor="addr-region" className={labelClass}>Region (optional)</label>
              <input id="addr-region" type="text" value={form.region} onChange={setField('region')} placeholder="District" className={inputClass} />
            </div>
            <div>
              <label htmlFor="addr-postal" className={labelClass}>Postal code (optional)</label>
              <input id="addr-postal" type="text" value={form.postal} onChange={setField('postal')} placeholder="1207" className={inputClass} />
            </div>
            <div>
              <label htmlFor="addr-country" className={labelClass}>Country</label>
              <input id="addr-country" type="text" value={form.country} onChange={setField('country')} className={inputClass} />
            </div>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="accent-[var(--accent)]"
            />
            Set as default address
          </label>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 bg-[var(--accent)] text-[#0e1320] text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] transition-colors cursor-pointer disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-utility)' }}
            >
              {editing === 'new' ? 'Add Address' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(null); setForm(blankForm(user?.name)); }}
              className="px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}