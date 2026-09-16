import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry, className = '' }) {
  return (
    <div className={`text-center py-12 ${className}`} role="alert">
      <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
      <p className="text-[var(--text-primary)] text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
