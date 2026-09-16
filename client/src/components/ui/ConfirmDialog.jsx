import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2 transition-colors disabled:opacity-50 ${
            danger
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-[var(--accent)] hover:bg-blue-500'
          }`}
        >
          {loading && <Spinner size={14} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
