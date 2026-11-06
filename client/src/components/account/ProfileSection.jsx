import { useState, useRef, useEffect } from 'react';
import { BadgeCheck, Camera, Loader2, Mail, RefreshCw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { updateMe, uploadAvatar } from '../../api/account';
import { resendVerification } from '../../api/auth';
import { useToast } from '../ui/Toast';

const inputClass =
  'w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)] disabled:opacity-60';
const labelClass = 'block text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1.5';

export default function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.phone]);

  const saveMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: async () => {
      toast({ type: 'success', message: 'Profile saved' });
      await refreshUser();
    },
    onError: (err) => toast({ type: 'error', message: err?.message || 'Failed to save profile' }),
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      toast({ type: 'success', message: 'Photo updated' });
      await refreshUser();
    },
    onError: (err) => toast({ type: 'error', message: err?.message || 'Photo upload failed' }),
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ type: 'error', message: 'Name is required' });
      return;
    }
    saveMutation.mutate({ name: name.trim(), phone: phone.trim() });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
    e.target.value = '';
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const result = await resendVerification();
      toast({ type: 'success', message: result.message || 'Verification email sent' });
    } catch (err) {
      toast({ type: 'error', message: err?.message || 'Failed to send verification email' });
    } finally {
      setResending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      toast({ type: 'info', message: 'Account status refreshed' });
    } catch {
      toast({ type: 'error', message: 'Failed to refresh account status' });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section aria-label="My profile">
      <h2
        className="text-2xl sm:text-3xl tracking-[0.15em] uppercase mb-5"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
      >
        My Profile
      </h2>

      <div className="border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] p-5 sm:p-6 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden text-[var(--text-secondary)]">
              {user?.avatar ? (
                <img src={user.avatar} alt="" width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl uppercase" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  {user?.name?.[0] || 'U'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarMutation.isPending}
              aria-label="Upload profile photo"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--accent)] text-[#0e1320] flex items-center justify-center hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
            >
              {avatarMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} aria-hidden="true" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className={labelClass}>Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label htmlFor="profile-email" className="block text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                Email
              </label>
              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Verified
                </span>
              ) : (
                <span className="text-xs text-yellow-400">Not verified</span>
              )}
            </div>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              className={inputClass}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Email is used to sign in and receive order updates. Contact support to change it.
            </p>
            {!user?.emailVerified && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  {resending ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <Mail size={12} aria-hidden="true" />}
                  Resend verification email
                </button>
                <button
                  type="button"
                  onClick={handleRefreshStatus}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
                  Refresh status
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="profile-phone" className={labelClass}>Phone</label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="mt-6 px-6 py-2.5 bg-[var(--accent)] text-[#0e1320] text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          style={{ fontFamily: 'var(--font-utility)' }}
        >
          {saveMutation.isPending && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
          {saveMutation.isPending ? 'Saving' : 'Save Changes'}
        </button>
      </div>
    </section>
  );
}