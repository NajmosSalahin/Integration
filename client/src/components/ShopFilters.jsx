import { SlidersHorizontal } from 'lucide-react';

export default function ShopFilters({ min, max, onChange, activeCount, onClear }) {
  const inputClass =
    'w-20 px-2 py-1.5 border border-[var(--border)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-[var(--text-secondary)]" aria-hidden="true" />
        <span className="text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Price
        </span>
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <span aria-hidden="true">৳</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={min}
            onChange={(e) => onChange('min', e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className={inputClass}
          />
          <span aria-hidden="true">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={max}
            onChange={(e) => onChange('max', e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className={inputClass}
          />
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-medium text-[var(--accent-hover)] hover:text-[var(--accent)] transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}