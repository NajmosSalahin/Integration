import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, message = 'Nothing here yet', action, actionLabel, onAction, className = '' }) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon size={32} className="mx-auto text-[var(--text-secondary)] mb-3" />
      <p className="text-[var(--text-secondary)] text-sm">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] rounded-lg transition-colors"
        >
          {actionLabel || 'Go'}
        </button>
      )}
      {action && !onAction && action}
    </div>
  );
}
