import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildItems(current, total) {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const items = [];
  let prev = 0;
  for (const page of pages) {
    if (page - prev > 1) {
      items.push({ type: 'gap', key: `gap-${prev}-${page}` });
    }
    items.push({ type: 'page', page });
    prev = page;
  }
  return items;
}

export default function Pagination({ current, total, onChange, className = '' }) {
  const [value, setValue] = useState('');
  const items = total <= 1 ? [] : buildItems(current, total);
  const clamp = (n) => Math.max(1, Math.min(total, n));

  const handleJump = (e) => {
    e.preventDefault();
    const n = Number(value);
    if (n && n >= 1 && n <= total) {
      onChange(n);
    }
    setValue('');
  };

  if (items.length === 0) return null;

  const btnBase = 'px-3.5 py-2 text-sm rounded-lg border transition-colors';
  const btnIdle = 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--text-secondary)]';

  return (
    <div className={`flex items-center justify-center gap-1.5 flex-wrap ${className}`}>
      <button
        onClick={() => onChange(clamp(current - 1))}
        disabled={current === 1}
        aria-label="Go to previous page"
        className={`${btnBase} ${btnIdle} inline-flex items-center gap-1`}
      >
        <ChevronLeft size={15} />
        Prev
      </button>

      {items.map((item) =>
        item.type === 'gap' ? (
          <span
            key={item.key}
            className="px-1 text-[var(--text-secondary)] select-none"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={item.page}
            onClick={() => onChange(item.page)}
            aria-label={`Go to page ${item.page}`}
            aria-current={item.page === current ? 'page' : undefined}
            className={`${btnBase} ${
              item.page === current
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : btnIdle
            }`}
          >
            {item.page}
          </button>
        )
      )}

      <button
        onClick={() => onChange(clamp(current + 1))}
        disabled={current === total}
        aria-label="Go to next page"
        className={`${btnBase} ${btnIdle} inline-flex items-center gap-1`}
      >
        Next
        <ChevronRight size={15} />
      </button>

      {total > 5 && (
        <form
          onSubmit={handleJump}
          className="flex items-center gap-1.5 ml-2 pl-3 border-l border-[var(--border)]"
        >
          <label htmlFor="jump-page" className="text-xs text-[var(--text-secondary)] sr-only">
            Go to page
          </label>
          <input
            id="jump-page"
            type="number"
            min={1}
            max={total}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`1-${total}`}
            className="w-16 px-2 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            aria-label={`Jump to page (1 to ${total})`}
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
}