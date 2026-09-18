import { useState } from 'react';
import { Loader2, KeyRound, Bell } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { changePassword, updateMe } from '../../api/account';
import { useToast } from '../ui/Toast';

const inputClass =
  'w-full px-3 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-secondary)]';
const labelClass = 'block text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1.5';

export default function SettingsSection() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const prefs = user?.notificationPrefs || { orderUpdates: true, newDrops: true };

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({ type: 'success', message: 'Password changed' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => toast({ type: 'error', message: err?.message || 'Failed to change password' }),
  });

  const prefsMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: async () => {
      toast({ type: 'success', message: 'Preferences saved' });
      await refreshUser();
    },
    onError: (err) => toast({ type: 'error', message: err?.message || 'Failed to save preferences' }),
  });

  const handlePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast({ type: 'error', message: 'Password must be 8+ characters with upper, lower, and a number' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  const togglePref = (key) => () => {
    prefsMutation.mutate({ notificationPrefs: { ...prefs, [key]: !prefs[key] } });
  };

  const switchClass = (on) =>
    `relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`;

  return (
    <section aria-label="Account settings" className="max-w-xl">
      <h2
        className="text-2xl sm:text-3xl tracking-[0.15em] uppercase mb-5"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
      >
        Account Settings
      </h2>

      <div className="border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] p-5 sm:p-6 mb-6">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 mb-4">
          <KeyRound size={15} className="text-[var(--accent)]" aria-hidden="true" />
          Change Password
        </h3>

        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label htmlFor="pw-current" className={labelClass}>Current password</label>
            <input
              id="pw-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pw-new" className={labelClass}>New password</label>
            <input
              id="pw-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="8+ chars, upper, lower, number"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className={labelClass}>Confirm new password</label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="px-5 py-2.5 bg-[var(--accent)] text-[#0e1320] text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-[var(--accent-hover)] disabled:bg-[var(--border)] disabled:text-[var(--text-secondary)] transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            style={{ fontFamily: 'var(--font-utility)' }}
          >
            {passwordMutation.isPending && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
            {passwordMutation.isPending ? 'Updating' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="border border-[var(--border)] rounded-[10px] bg-[var(--bg-secondary)] p-5 sm:p-6">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 mb-1">
          <Bell size={15} className="text-[var(--accent)]" aria-hidden="true" />
          Notifications
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Choose what you hear about from us.</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Order updates</p>
              <p className="text-xs text-[var(--text-secondary)]">Email when your order status changes</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.orderUpdates}
              aria-label="Toggle order update emails"
              onClick={togglePref('orderUpdates')}
              disabled={prefsMutation.isPending}
              className={switchClass(prefs.orderUpdates)}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs.orderUpdates ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-primary)]">New drops</p>
              <p className="text-xs text-[var(--text-secondary)]">Email about new designs and collections</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.newDrops}
              aria-label="Toggle new drop emails"
              onClick={togglePref('newDrops')}
              disabled={prefsMutation.isPending}
              className={switchClass(prefs.newDrops)}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${prefs.newDrops ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}