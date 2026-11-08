const TONES = {
  default: 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]',
  accent: 'text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]',
  emerald: 'text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:text-emerald-400',
  amber: 'text-[var(--text-secondary)] hover:bg-amber-500/10 hover:text-amber-400',
  danger: 'text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400',
};

export default function IconButton({
  label,
  title,
  onClick,
  disabled = false,
  tone = 'default',
  children,
  className = '',
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${TONES[tone] || TONES.default} ${className}`}
    >
      {children}
    </button>
  );
}
