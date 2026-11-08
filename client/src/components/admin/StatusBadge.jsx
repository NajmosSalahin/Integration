const TONES = {
  neutral: 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  red: 'border-red-500/20 bg-red-500/10 text-red-400',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  orange: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
};

export default function StatusBadge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${TONES[tone] || TONES.neutral} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
